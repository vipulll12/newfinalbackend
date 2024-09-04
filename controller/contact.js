require("dotenv").config();
const mailsender = require("../mail/mailSender");

exports.sendMail = async (req, res) => {
  const { name, email, message, mobile } = req.body;

  // HTML template for the email body
  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Form HeyBuddy</title>
      <style>
        /* Styles from the previous HTML template */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Contact Form HeyBuddy</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Message:</strong> ${message}</p>
      </div>
      <footer>
        <p>This email was sent via the HeyBuddy Contact Form.</p>
      </footer>
    </body>
    </html>
  `;

  try {
    // Send the email using mailsender with the HTML template
    await mailsender(email, "Contact Form HeyBuddy", emailBody);

    // If the email is sent successfully, respond to the client
    res.json({ message: "Form submitted successfully" });
  } catch (error) {
    // Handle any errors that occur during email sending
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
