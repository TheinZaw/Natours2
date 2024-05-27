const nodeMailer = require('nodemailer');
const pug = require('pug');
const html2Text = require('html-to-text');
// const sgMail = require('@sendgrid/mail');
//const client = require('@sendMail/client');
const path = require('path');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.name = user.name.split(' ')[0];
      this.url = url;
      this.from = `Admin <${process.env.EMAIL_FROM}>`;
   }

   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         //use sendgrid in production
         return nodeMailer.createTransport({
            // service: 'sendgrid',
            host: process.env.SENDGRID_HOST,
            port: process.env.SENDGRID_PORT,
            auth: {
               user: process.env.SENDGRID_USER,
               pass: process.env.SENDGRID_PWD,
            },
         });
         // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

         // return sgMail;
      }

      return nodeMailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
         },
      });
   }
   async send(template, subject) {
      const html = pug.renderFile(
         path.join(`${__dirname}`, `../views/emails/${template}.pug`),
         // `${__dirname}/../views/emails/${template}.pug`,
         { firstName: this.name, url: this.url, subject },
      );

      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: html2Text.htmlToText(html), //html:
      };

      const objTr = this.newTransport();
      //console.log(objTr);
      if (process.env.NODE_ENV === 'production') {
         await objTr.sendMail(mailOptions);
      } else {
         await objTr.sendMail(mailOptions);
      }
   }

   async sendWelcome() {
      await this.send('welcome', 'Welcome to the Natours Family!');
   }

   async sentPasswordReset() {
      await this.send(
         'passwordReset',
         'Your password reset token (valid for only 10 minutes) ',
      );
   }
};
