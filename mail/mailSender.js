const nodemailer = require("nodemailer");
require("dotenv").config();

async function mailsender(email, title, body) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "Renderease",
      to: process.env.RECEIVER_MAIL,
      subject: `${title}`,
      html: `${body}`,
    });
    return info;
  } catch (error) {
    console.log("error in sending mail, in NODEMAILER");
    console.log(error);
  }
}
module.exports = mailsender;
