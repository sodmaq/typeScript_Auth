import nodemailer from "nodemailer";
import { load } from "ts-dotenv";

const env = load({
  MAIL_ID: String,
  MAIL_PASSWORD: String,
});

const sendEmail = async (
  toEmail: string,
  subject: string,
  text: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Gmail SMTP server
      port: 465, // SMTP port for secure connection
      secure: true, // true for 465, false for other ports
      auth: {
        user: env.MAIL_ID,
        pass: env.MAIL_PASSWORD,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Sodmaq" <sodmaq@gmail.com>',
      to: toEmail,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", toEmail);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

export { sendEmail };
