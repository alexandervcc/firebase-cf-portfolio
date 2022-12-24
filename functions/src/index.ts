import functions = require("firebase-functions");
import { initializeApp } from "firebase-admin/app";
import nodemailer = require("nodemailer");
import { defineSecret } from "firebase-functions/params";
const cors = require("cors")({ origin: true });

const GMAIL_ACCOUNT = defineSecret("GMAIL_ACCOUNT");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

initializeApp();

let transporter: any = null;

export const sendMail = functions
  .runWith({ secrets: [GMAIL_ACCOUNT, GMAIL_PASS] })
  .https.onRequest((req, res) => {
    cors(req, res, () => {
      const method = req.method;
      if (method !== "POST") {
        return res.send("Invalid method.");
      }
      
      const { name, email, message } = req.body;

      if (
        !checkPresentParameter(name) ||
        !checkPresentParameter(email) ||
        !checkPresentParameter(message)
      ) {
        return res.send("Fill all the parameters.");
      }

      if (!isValidEmail(email)) {
        return res.send("Insert a valid email.");
      }

      transporterLazyLoad(
        transporter,
        GMAIL_ACCOUNT.value(),
        GMAIL_PASS.value()
      );

      const mailOptions = {
        from: GMAIL_ACCOUNT.value(),
        to: email,
        subject: "New contact!!!",
        html: `<h3 style="font-size: 16px;">Portfolio Contact!</h3>
                <p>Name: ${name}</p>
                <br />
                <p>Email: ${email}</p>
                <br />
                <p>Message: ${message}</p>
                <br />
            `,
      };

      return transporter.sendMail(mailOptions, (error: { toString: () => any; }, info: any) => {
        if (error) {
          return res.send(error.toString()  );
        }
        return res.send("Email sent, I'll be in touch soon!!!");
      });
    });
  });

const isValidEmail = (email: string): boolean => {
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return expression.test(email);
};

const checkPresentParameter = (val?: string) => {
  return val === null || val === undefined || val.length === 0;
};

const transporterLazyLoad = (transporter: any, email: string, pass: string) => {
  if (transporter === null) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: pass,
      },
    });
  }
};
