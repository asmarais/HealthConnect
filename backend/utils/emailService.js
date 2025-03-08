const nodemailer = require('nodemailer');


const sendEmail = async (to, subject = "CarRental",prenom,  mot_de_passe) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  });

  const emailContent = ` 
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
      .password {
        font-weight: bold;
        color: #e74c3c;
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
      <h1>Welcome to CarRental</h1>
      <p>Dear ${prenom},</p>
      <p>Thank you for signing up with us. We are excited to have you onboard!</p>
      <p>Your temporary password is: <span class="password">${mot_de_passe}</span></p>
      <p>We recommend changing your password after your first login.</p>
      <p>Best regards,</p>
      <p>The CarRental Team</p>
      <div class="footer">
        &copy; 2024 CarRental. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  // Set up email data with HTML content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: emailContent, 
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email failed to send:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
