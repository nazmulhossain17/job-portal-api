import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.SECRET_TOKEN,
  mailAddress: process.env.GMAIL,
  mailPassword: process.env.MAIL_PASSWORD,
  customMail: process.env.CUSTOM_SENDER_ADDRESS,
};
