import dotenv from 'dotenv';
import Twilio from 'twilio';
import fs from 'fs';

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = process.env;

let client = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else {
  console.warn('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in env.');
}

export const sendSms = async ({ to, body }) => {
  if (!client) throw new Error('Twilio client not configured');
  if (!TWILIO_FROM) throw new Error('TWILIO_FROM not configured');
  const msg = await client.messages.create({
    from: TWILIO_FROM,
    to,
    body
  });
  return msg;
};

export default client;
