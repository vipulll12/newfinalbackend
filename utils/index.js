const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendVerifyEmail(data) {
  const { email, otp } = data;
  try {
    const message = {
      from: "info@renderease.com",
      to: email,
      subject: "Verify your email",
      text: `Please verify your email address by using OTP: ${otp}`,
    };

    await transporter.sendMail(message);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    return false;
  }
}

module.exports = {
  sendVerifyEmail,
};
