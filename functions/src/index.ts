import functions = require("firebase-functions");
import { initializeApp } from "firebase-admin/app";
import nodemailer = require("nodemailer");
import { defineSecret } from "firebase-functions/params";
const cors = require("cors")({ origin: true });

const GMAIL_ACCOUNT = defineSecret("GMAIL_ACCOUNT");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_ACCOUNT.value(),
    pass: GMAIL_PASS.value(),
  },
});

exports.sendMail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const destinationEmail = req.query.dest as string;

    if (
      destinationEmail === null ||
      destinationEmail === undefined ||
      destinationEmail.length === 0
    ) {
      return;
    }

    if (!isValidEmail(destinationEmail)) {
      return;
    }

    const mailOptions = {
      from: GMAIL_ACCOUNT.value(),
      to: destinationEmail,
      subject: "Hello!!!",
      html: `<h3 style="font-size: 16px;">Thanks for your request!!</h3>
                <p>I will responde you as soon as I read your email and requirement. Until then enjoy this image!</p>
                <br />
                <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
            `,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.send(error.toString());
      }
      return res.send("Email sent, I'll be in touch soon!!!");
    });
  });
});

const isValidEmail = (email: string): boolean => {
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return expression.test(email);
};
