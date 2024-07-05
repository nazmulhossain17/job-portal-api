import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const mailAddress = config.mailAddress;
const mailPassword = config.mailPassword;
const customSenderAddress = config.customMail || 'no-reply@nazmuljobportal.com'; // Provide a default value

if (!mailAddress || !mailPassword) {
  throw new Error('Mail address and password must be defined in the config.');
}

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailAddress,
    pass: mailPassword,
  },
});

const sendMail = (
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<nodemailer.SentMessageInfo> => {
  const mailOptions: MailOptions = {
    from: `No Reply <${customSenderAddress}>`, // Use a display name with the custom sender address
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export { sendMail };
