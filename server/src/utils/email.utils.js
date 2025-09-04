import crypto from 'crypto';
import transporter from '../config/nodemailer.config.js';

// Generate a random OTP (6 digits)
export const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random verification token
export const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Send email verification with both OTP and link
export const sendEmailVerification = async (email, otp, token, username) => {
	const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM || 'noreply@justflow.com',
		to: email,
		subject: 'JustFlow - Verify Your Email Address',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="margin: 0; font-size: 28px;">JustFlow</h1>
					<p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
				</div>
				
				<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						Thank you for registering with JustFlow! To complete your account verification, 
						you can use either of the following methods:
					</p>
					
					<!-- OTP Section -->
					<div style="background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
						<h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Method 1: OTP Verification</h3>
						<p style="color: #666; margin-bottom: 15px;">Enter this 6-digit code in the verification form:</p>
						<div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0;">
							<h3 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
							<p style="color: #999; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
						</div>
					</div>
					
					<!-- Link Section -->
					<div style="background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
						<h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Method 2: Link Verification</h3>
						<p style="color: #666; margin-bottom: 15px;">Click the button below to verify your email:</p>
						<div style="text-align: center; margin: 15px 0;">
							<a href="${verificationUrl}" 
							   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
							          color: white; 
							          padding: 15px 30px; 
							          text-decoration: none; 
							          border-radius: 25px; 
							          display: inline-block; 
							          font-weight: bold;
							          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
								Verify Email Address
							</a>
						</div>
						<p style="color: #666; line-height: 1.6; margin-bottom: 15px; font-size: 14px;">
							If the button doesn't work, you can copy and paste this link into your browser:
						</p>
						<p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 15px 0; word-break: break-all;">
							<a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
						</p>
						<p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
							This link will expire in 24 hours.
						</p>
					</div>
					
					<div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; margin: 20px 0;">
						<p style="color: #1976d2; margin: 0; font-size: 14px; text-align: center;">
							<strong>Choose either method - you only need to verify once!</strong>
						</p>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						If you didn't create an account with JustFlow, please ignore this email.
					</p>
					
					<div style="text-align: center; margin-top: 30px;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This is an automated email. Please do not reply to this message.
						</p>
					</div>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending verification email:', error);
		return false;
	}
};

// Send email verification with OTP
export const sendEmailVerificationOTP = async (email, otp, username) => {
	const mailOptions = {
		from: process.env.EMAIL_FROM || 'noreply@justflow.com',
		to: email,
		subject: 'JustFlow - Email Verification OTP',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="margin: 0; font-size: 28px;">JustFlow</h1>
					<p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
				</div>
				
				<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						Thank you for registering with JustFlow! To complete your account verification, 
						please use the following OTP (One-Time Password):
					</p>
					
					<div style="background: #fff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
						<h3 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
						<p style="color: #999; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						If you didn't create an account with JustFlow, please ignore this email.
					</p>
					
					<div style="text-align: center; margin-top: 30px;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This is an automated email. Please do not reply to this message.
						</p>
					</div>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending OTP email:', error);
		return false;
	}
};

// Send email verification with link
export const sendEmailVerificationLink = async (email, token, username) => {
	const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM || 'noreply@justflow.com',
		to: email,
		subject: 'JustFlow - Verify Your Email Address',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="margin: 0; font-size: 28px;">JustFlow</h1>
					<p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
				</div>
				
				<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						Thank you for registering with JustFlow! To complete your account verification, 
						please click the button below to verify your email address:
					</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}" 
						   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
						          color: white; 
						          padding: 15px 30px; 
						          text-decoration: none; 
						          border-radius: 25px; 
						          display: inline-block; 
						          font-weight: bold;
						          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
							Verify Email Address
						</a>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
						If the button doesn't work, you can copy and paste this link into your browser:
					</p>
					
					<p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
						<a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
					</p>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						This link will expire in 24 hours. If you didn't create an account with JustFlow, 
						please ignore this email.
					</p>
					
					<div style="text-align: center; margin-top: 30px;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This is an automated email. Please do not reply to this message.
						</p>
					</div>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending verification link email:', error);
		return false;
	}
};

// Send password reset OTP
export const sendPasswordResetOTP = async (email, otp, username) => {
	const mailOptions = {
		from: process.env.EMAIL_FROM || 'noreply@justflow.com',
		to: email,
		subject: 'JustFlow - Password Reset OTP',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="margin: 0; font-size: 28px;">JustFlow</h1>
					<p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
				</div>
				
				<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						We received a request to reset your password. Use the following OTP to complete the process:
					</p>
					
					<div style="background: #fff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
						<h3 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
						<p style="color: #999; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						If you didn't request a password reset, please ignore this email and your password will remain unchanged.
					</p>
					
					<div style="text-align: center; margin-top: 30px;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This is an automated email. Please do not reply to this message.
						</p>
					</div>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending password reset OTP email:', error);
		return false;
	}
};

// Send password reset link
export const sendPasswordResetLink = async (email, token, username) => {
	const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM || 'noreply@justflow.com',
		to: email,
		subject: 'JustFlow - Reset Your Password',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="margin: 0; font-size: 28px;">JustFlow</h1>
					<p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
				</div>
				
				<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						We received a request to reset your password. Click the button below to create a new password:
					</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}" 
						   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
						          color: white; 
						          padding: 15px 30px; 
						          text-decoration: none; 
						          border-radius: 25px; 
						          display: inline-block; 
						          font-weight: bold;
						          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
							Reset Password
						</a>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
						If the button doesn't work, you can copy and paste this link into your browser:
					</p>
					
					<p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
						<a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
					</p>
					
					<p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
						This link will expire in 1 hour. If you didn't request a password reset, 
						please ignore this email and your password will remain unchanged.
					</p>
					
					<div style="text-align: center; margin-top: 30px;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This is an automated email. Please do not reply to this message.
						</p>
					</div>
				</div>
			</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending password reset link email:', error);
		return false;
	}
};
