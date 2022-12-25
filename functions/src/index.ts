import functions = require("firebase-functions");
import { initializeApp } from "firebase-admin/app";
import nodemailer = require("nodemailer");
import { defineSecret } from "firebase-functions/params";
import { RequestBody } from "./body";
const cors = require("cors")({ origin: true });

const GMAIL_ACCOUNT = defineSecret("GMAIL_ACCOUNT");
const GMAIL_PASS = defineSecret("GMAIL_PASS");
const GMAIL_DEST = defineSecret("GMAIL_DEST");

initializeApp();

export const sendMail = functions
  .runWith({ secrets: [GMAIL_ACCOUNT, GMAIL_PASS, GMAIL_DEST] })
  .https.onRequest((req, res) => {
    cors(req, res, () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method not allowed." });
      }

      const body = req.body as RequestBody;

      if (
        valueIsEmpty(body.name) ||
        valueIsEmpty(body.email) ||
        valueIsEmpty(body.message)
      ) {
        return res.status(400).send({ error: "Fill all the parameters." });
      }

      if (!isValidEmail(body.email)) {
        return res.status(400).send({ error: "Insert a valid email." });
      }

      const mailOptions = {
        from: GMAIL_ACCOUNT.value(),
        to: GMAIL_DEST.value(),
        subject: "Portfolio Contact Request",
        html: `<h3>New Portfolio Contact!!!</h3>
                <p>Name: ${body.name}</p>
                <p>Email: ${body.email}</p>
                <p>Message: ${body.message}</p>
            `,
      };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_ACCOUNT.value(),
          pass: GMAIL_PASS.value(),
        },
      });

      return transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          res.status(500).send({
            error: "Something went wrong :(, please try again later. ",
          });
        } else {
          res.status(200).send({
            res: "Thanks for your message, I will contact you soon!!!.",
          });
        }
      });
    });
  });

const isValidEmail = (email: string): boolean => {
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return expression.test(email);
};

const valueIsEmpty = (val: string) => {
  return val === null || val === undefined;
};
