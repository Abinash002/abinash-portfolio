/**
 * Vercel / Netlify / Node.js Serverless Function for Portfolio Contact Form
 * Uses nodemailer with Gmail SMTP (App Password)
 */

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, email, message).'
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER || 'abinashfab098@gmail.com',
        pass: process.env.GMAIL_PASS || 'gnzsfymsixhgnkrw'
      }
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER || 'abinashfab098@gmail.com'}>`,
      replyTo: `"${name}" <${email}>`,
      to: process.env.GMAIL_USER || 'abinashfab098@gmail.com',
      subject: `New Portfolio Message from ${name}`,
      text: `New message from ${name} (${email}):\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0c1827 0%, #152840 100%); padding: 24px; color: #ffffff;">
            <p style="color: #FF7020; margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Portfolio Inquiry</p>
            <h2 style="margin: 6px 0 0; font-size: 20px;">New Message from ${escapeHtml(name)}</h2>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 10px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 16px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #0066FF;">${escapeHtml(email)}</a></p>
            <p style="margin: 0 0 6px;"><strong>Message:</strong></p>
            <div style="background: #f8fafc; border-left: 4px solid #FF7020; padding: 14px 16px; border-radius: 6px; white-space: pre-wrap; font-size: 15px; color: #1e293b;">
              ${escapeHtml(message)}
            </div>
            <p style="margin-top: 24px;">
              <a href="mailto:${escapeHtml(email)}?subject=Re: Your message to Abinash" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reply to ${escapeHtml(name)} &rarr;</a>
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
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message: ' + error.message
    });
  }
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
