/**
 * Node.js Express Server for Abinash Portfolio
 * Serves static portfolio files and handles /api/sendmail using Gmail SMTP
 */

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static website files
app.use(express.static(__dirname));

// Email API Endpoint
app.post(['/api/sendmail', '/sendmail'], async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (name, email, message).'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'abinashfab098@gmail.com',
        pass: 'gnzsfymsixhgnkrw'
      }
    });

    const mailOptions = {
      from: `"Portfolio Contact" <abinashfab098@gmail.com>`,
      replyTo: `"${name}" <${email}>`,
      to: 'abinashfab098@gmail.com',
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0c1827 0%, #152840 100%); padding: 24px; color: #ffffff;">
            <p style="color: #FF7020; margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Portfolio Inquiry</p>
            <h2 style="margin: 6px 0 0; font-size: 20px;">New Message from ${name}</h2>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 10px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0066FF;">${email}</a></p>
            <p style="margin: 0 0 6px;"><strong>Message:</strong></p>
            <div style="background: #f8fafc; border-left: 4px solid #FF7020; padding: 14px 16px; border-radius: 6px; font-size: 15px; color: #1e293b; white-space: pre-wrap;">
              ${message}
            </div>
            <p style="margin-top: 24px;">
              <a href="mailto:${email}?subject=Re: Your message to Abinash" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reply to ${name} &rarr;</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: `Thank you, ${name}! Your message has been sent successfully.`
    });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message: ' + err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
