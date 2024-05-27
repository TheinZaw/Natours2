const nodeMailer = require('nodemailer');
const sendMail = async (options) => {
   //    const transporter = nodeMailer.createTransport({
   //       host: 'smtp.WebSiteLive.net',
   //       port: 25,
   //       auth: { user: admin@37zay.com, pass: admin@123456 },
   //    });

   var transporter = nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PWD,
      },
   });
   const mailOptions = {
      from: 'Admin <admin@37zay.com>',
      to: options.email,
      subject: options.subject,
      text: options.message, //html:
   };
   await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
