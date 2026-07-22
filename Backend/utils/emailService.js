const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If credentials are not set, mock the send and print to console
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'mock_user@example.com') {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('------------------------');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'PGVerse'} <${process.env.FROM_EMAIL || 'noreply@pgverse.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
