const nodemailer = require('nodemailer');
const sendEmail = async (to, type, prenom, mot_de_passe = "") => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  });

  let subject = "HealthConnect Notification";
  let emailContent = "";

  if (type === "account_approved") {
    subject = "Welcome to HealthConnect!";
    emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #4CAF50;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to HealthConnect!</h1>
          <p>Dear Dr. ${prenom},</p>
          <p>We are delighted to inform you that your application has been approved. You are now officially a member of HealthConnect.</p>
          <p>You can log in using your email and the password you set during registration.</p>
          <p>Best regards,</p>
          <p>The HealthConnect Team</p>
          <div class="footer">
            &copy; 2024 HealthConnect. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  } else if (type === "account_rejected") {
    subject = "HealthConnect Application Status";
    emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #e74c3c;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>HealthConnect Application Update</h1>
          <p>Dear Dr. ${prenom},</p>
          <p>We regret to inform you that your application to join HealthConnect has not been approved at this time.</p>
          <p>If you have any questions, please feel free to contact our support team.</p>
          <p>Best regards,</p>
          <p>The HealthConnect Team</p>
          <div class="footer">
            &copy; 2024 HealthConnect. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: emailContent,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} for ${type}`);
  } catch (error) {
    console.error("Email failed to send:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
