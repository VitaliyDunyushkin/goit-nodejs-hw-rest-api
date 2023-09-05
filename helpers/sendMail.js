const sendgrid = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY } = process.env;

async function sendMail({ to, subject, html }) {
  const letter = {
    from: "vitaliy.dunyushkin@gmail.com",
    to,
    subject,
    html,
  };

  sendgrid.setApiKey(SENDGRID_API_KEY);

  await sendgrid.send(letter);
}

module.exports = sendMail;
