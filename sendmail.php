<?php
/**
 * Standalone PHP Mailer for Portfolio Contact Form
 * Directly connects to Gmail SMTP (smtp.gmail.com:587) via TLS sockets
 * Requires zero external composer packages - works out of the box on any standard PHP hosting
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Read inputs from JSON or POST data
$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? $_POST['name'] ?? '');
$email = trim($input['email'] ?? $_POST['email'] ?? '');
$message = trim($input['message'] ?? $_POST['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields (name, email, message).']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

$smtpHost = 'smtp.gmail.com';
$smtpPort = 587;
$smtpUser = 'abinashfab098@gmail.com';
$smtpPass = 'gnzsfymsixhgnkrw';

try {
    $socket = stream_socket_client("tcp://{$smtpHost}:{$smtpPort}", $errno, $errstr, 20);
    if (!$socket) {
        throw new Exception("Could not connect to SMTP server: $errstr ($errno)");
    }

    function readResponse($socket) {
        $data = '';
        while ($str = fgets($socket, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $data;
    }

    function sendCommand($socket, $cmd) {
        fputs($socket, $cmd . "\r\n");
        return readResponse($socket);
    }

    readResponse($socket);
    sendCommand($socket, 'EHLO ' . gethostname());
    sendCommand($socket, 'STARTTLS');

    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new Exception("TLS encryption failed");
    }

    sendCommand($socket, 'EHLO ' . gethostname());
    sendCommand($socket, 'AUTH LOGIN');
    sendCommand($socket, base64_encode($smtpUser));
    $authResp = sendCommand($socket, base64_encode($smtpPass));

    if (strpos($authResp, '235') === false) {
        throw new Exception("SMTP Authentication failed: " . trim($authResp));
    }

    sendCommand($socket, "MAIL FROM: <{$smtpUser}>");
    sendCommand($socket, "RCPT TO: <{$smtpUser}>");
    sendCommand($socket, 'DATA');

    $subject = "New Portfolio Message from " . $name;
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

    $boundary = md5(uniqid(time()));
    $headers  = "From: =?UTF-8?B?" . base64_encode("Portfolio Contact") . "?= <{$smtpUser}>\r\n";
    $headers .= "Reply-To: {$safeName} <{$email}>\r\n";
    $headers .= "To: <{$smtpUser}>\r\n";
    $headers .= "Subject: {$encodedSubject}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

    $htmlBody = "
    <div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;'>
      <div style='background: linear-gradient(135deg, #0c1827 0%, #152840 100%); padding: 24px; color: #ffffff;'>
        <p style='color: #FF7020; margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase;'>Portfolio Inquiry</p>
        <h2 style='margin: 6px 0 0; font-size: 20px;'>New Message from {$safeName}</h2>
      </div>
      <div style='padding: 24px;'>
        <p style='margin: 0 0 10px;'><strong>Name:</strong> {$safeName}</p>
        <p style='margin: 0 0 16px;'><strong>Email:</strong> <a href='mailto:{$safeEmail}' style='color: #0066FF;'>{$safeEmail}</a></p>
        <p style='margin: 0 0 6px;'><strong>Message:</strong></p>
        <div style='background: #f8fafc; border-left: 4px solid #FF7020; padding: 14px 16px; border-radius: 6px; font-size: 15px; color: #1e293b;'>
          {$safeMessage}
        </div>
        <p style='margin-top: 24px;'>
          <a href='mailto:{$safeEmail}?subject=Re: Your message to Abinash' style='display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;'>Reply to {$safeName} &rarr;</a>
        </p>
      </div>
    </div>";

    $plainBody = "New message from {$name} ({$email}):\n\n{$message}";

    $body  = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $body .= $plainBody . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--{$boundary}--\r\n";

    sendCommand($socket, $headers . "\r\n" . $body . "\r\n.");
    sendCommand($socket, 'QUIT');
    fclose($socket);

    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$name}! Your message has been sent successfully."
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message: ' . $e->getMessage()
    ]);
}
