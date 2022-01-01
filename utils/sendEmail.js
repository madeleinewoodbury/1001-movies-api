const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: 'apikey',
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: process.env.FROM_EMAIL,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
};

module.exports = sendEmail;
