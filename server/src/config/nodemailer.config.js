import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from './config.js';

const transporter = nodemailer.createTransport({
	host: EMAIL_HOST,
	port: EMAIL_PORT,
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS,
	},
});

export default transporter;