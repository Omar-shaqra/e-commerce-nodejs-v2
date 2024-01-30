//nodemailer
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) create transporter (service that will send email like "gmail","mailgun",....)
  const transporter = nodemailer.createTransport({
    host: process.env.Email_Host,
    port: process.env.Email_PORT, //if secure = false ,port = 587
    secure: true,
    auth: {
      user: process.env.Email_USER,
      pass: process.env.Email_pass,
    },
  });
  // 2) define email optiions (like from , to , content , subject)
  const mailoption = {
    from: "E-shop App <omarshaqra26@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3) send the email
  console.log(mailoption);

  await transporter.sendMail(mailoption);
};

module.exports = sendEmail;
