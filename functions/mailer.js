const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config = require("config");

const app_url = config.get("app_url");
const USERNAME = config.get("user");
const PASSWORD = config.get("pass");

handlebars.registerHelper("app_url", () => app_url);

let filePath;

// ATCION : email sender.

const send = ({ action = "order_checkout", send_to, subject, data }) => {
  new Promise((resolve, reject) => {
    // eslint-disable-next-line eqeqeq
    if (action == "order_checkout") {
      filePath = "/static/email/orderSuccess.hbs"
    }

    if(action === 'verify_email'){
      filePath = "/static/email/verifyEmail.hbs"
    }

    const readHTMLFile = (path, callback) => {
      fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
        if (err) {
          // eslint-disable-next-line callback-return
          callback(err);
        } else {
          // eslint-disable-next-line callback-return
          callback(null, html);
        }
      });
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: USERNAME,
        pass: PASSWORD,
      },
    });

    // eslint-disable-next-line no-path-concat
    readHTMLFile(path.join(__dirname + filePath), (err, html) => {
      console.log("Email ERR:", err);
      var template = handlebars.compile(html);
      var htmlToSend = template(data);
      var mailOptions = {
        from: USERNAME,
        to: `${send_to}`,
        subject: subject || "No subject sent!",
        html: htmlToSend,
      };
      transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          reject(error);
        }
        resolve(response);
      });
    });
  });
};

module.exports = { send };