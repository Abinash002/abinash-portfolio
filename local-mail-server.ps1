# ==============================================================================
# Local Mail Server for Portfolio Contact Form
# Sends contact form submissions directly to abinashfab098@gmail.com via Gmail SMTP
# Powered by Windows PowerShell (.NET System.Net.Mail & System.Net.HttpListener)
# ==============================================================================

$port = 3001
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")

$GMAIL_USER = "abinashfab098@gmail.com"
$GMAIL_PASS = "gnzsfymsixhgnkrw"

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [OK] Portfolio Local Mail Server is RUNNING" -ForegroundColor Green
    Write-Host " Listening on: http://127.0.0.1:$port/api/sendmail" -ForegroundColor Yellow
    Write-Host " Forwarding to: $GMAIL_USER via smtp.gmail.com" -ForegroundColor Yellow
    Write-Host " Press Ctrl+C to stop." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to start listener: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers for browser requests
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        $response.ContentType = "application/json; charset=utf-8"

        # Handle Preflight OPTIONS
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        # Health check GET
        if ($request.HttpMethod -eq "GET") {
            $msg = '{"status":"online","service":"Abinash Portfolio Mail Server","recipient":"' + $GMAIL_USER + '"}'
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.ContentLength64 = $buffer.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        # Handle POST sendmail
        if ($request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $name = ""
            $email = ""
            $message = ""

            $trimmed = if ($body) { $body.Trim() } else { "" }

            # Attempt JSON parsing first
            if ($trimmed.StartsWith("{")) {
                try {
                    $json = $trimmed | ConvertFrom-Json
                    if ($json.name) { $name = [string]$json.name }
                    if ($json.email) { $email = [string]$json.email }
                    if ($json.message) { $message = [string]$json.message }
                } catch {}
            }

            # If still empty, parse url-encoded form data
            if ([string]::IsNullOrWhiteSpace($name)) {
                $pairs = $body -split '&'
                foreach ($pair in $pairs) {
                    $kv = $pair -split '='
                    if ($kv.Length -ge 2) {
                        $key = [System.Uri]::UnescapeDataString($kv[0].Replace('+', ' '))
                        $val = [System.Uri]::UnescapeDataString($kv[1].Replace('+', ' '))
                        if ($key -eq "name") { $name = $val }
                        if ($key -eq "email") { $email = $val }
                        if ($key -eq "message") { $message = $val }
                    }
                }
            }

            if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($message)) {
                $err = '{"success":false,"message":"Please fill in all required fields (name, email, message)."}'
                $buf = [System.Text.Encoding]::UTF8.GetBytes($err)
                $response.StatusCode = 400
                $response.ContentLength64 = $buf.Length
                $response.OutputStream.Write($buf, 0, $buf.Length)
                $response.Close()
                continue
            }

            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Processing message from: $name <$email>" -ForegroundColor White

            # Send Email via Gmail SMTP
            $smtp = New-Object System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
            $smtp.EnableSsl = $true
            $smtp.Credentials = New-Object System.Net.NetworkCredential($GMAIL_USER, $GMAIL_PASS)

            $mail = New-Object System.Net.Mail.MailMessage
            $mail.From = New-Object System.Net.Mail.MailAddress($GMAIL_USER, "Portfolio Contact: $name")
            $mail.To.Add($GMAIL_USER)
            $mail.ReplyToList.Add((New-Object System.Net.Mail.MailAddress($email, $name)))
            $mail.Subject = "New Portfolio Message from $name"
            $mail.IsBodyHtml = $true

            $safeName = [System.Web.HttpUtility]::HtmlEncode($name)
            $safeEmail = [System.Web.HttpUtility]::HtmlEncode($email)
            $safeMsg = [System.Web.HttpUtility]::HtmlEncode($message)

            $mail.Body = @"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #e9ecef; }
    .header { background: linear-gradient(135deg, #0c1827 0%, #152840 100%); padding: 26px 30px; text-align: left; }
    .header h2 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.2px; }
    .header p { color: #FF7020; margin: 4px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .body { padding: 30px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #6c757d; font-weight: 700; margin-bottom: 4px; }
    .value { font-size: 16px; color: #212529; font-weight: 500; }
    .message-box { background: #f8fafc; border-left: 4px solid #FF7020; padding: 18px 20px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; word-break: break-word; }
    .footer { background: #f8f9fa; padding: 16px 30px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #868e96; }
    .btn-reply { display: inline-block; margin-top: 20px; background: #0066FF; color: #ffffff !important; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <p>Abinash Portfolio Contact</p>
      <h2>New Client Message Received</h2>
    </div>
    <div class='body'>
      <div class='field'>
        <div class='label'>Sender Name</div>
        <div class='value'>$safeName</div>
      </div>
      <div class='field'>
        <div class='label'>Email Address</div>
        <div class='value'><a href='mailto:$safeEmail' style='color: #0066FF; text-decoration: none;'>$safeEmail</a></div>
      </div>
      <div class='field'>
        <div class='label'>Message Content</div>
        <div class='message-box'>$safeMsg</div>
      </div>
      <a class='btn-reply' href='mailto:$safeEmail?subject=Re: Your message to Abinash'>Reply to $safeName &rarr;</a>
    </div>
    <div class='footer'>
      Received via your portfolio website contact form &bull; Delivered to $GMAIL_USER
    </div>
  </div>
</body>
</html>
"@

            $smtp.Send($mail)
            Write-Host " [SUCCESS] Email delivered to $GMAIL_USER from $email" -ForegroundColor Green

            $safeCleanName = $name.Replace('"', '\"')
            $respJson = "{`"success`":true,`"message`":`"Thank you, $safeCleanName! Your message has been sent successfully.`"}"
            $respBuf = [System.Text.Encoding]::UTF8.GetBytes($respJson)
            $response.StatusCode = 200
            $response.ContentLength64 = $respBuf.Length
            $response.OutputStream.Write($respBuf, 0, $respBuf.Length)
            $response.Close()
        }
    } catch {
        Write-Host " [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($context -and $context.Response) {
            try {
                $errJson = '{"success":false,"message":"Server error: ' + $_.Exception.Message.Replace('"', '\"') + '"}'
                $errBuf = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $context.Response.StatusCode = 500
                $context.Response.ContentLength64 = $errBuf.Length
                $context.Response.OutputStream.Write($errBuf, 0, $errBuf.Length)
                $context.Response.Close()
            } catch {}
        }
    }
}
