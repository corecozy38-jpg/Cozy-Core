import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
configDotenv();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MERCHANT_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `${process.env.CORS_ORIGIN}auth/verify-email?token=${verificationToken}`;
    const subject = 'Verify your email address';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Email</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; text-align: center; }
                a{ text-decoration: none; }
                .button { display: inline-block; background-color: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to CoZ Core!</h1>
                </div>
                <div class="content">
                    <p>Please verify your email address to activate your account.</p>
                    <a href="${verificationLink}" class="button">Verify Email</a>
                    <p>This link expires in <strong>24 hours</strong>.</p>
                    <p>If you did not create an account, you can ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 CoZ Core. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    try {
        await transporter.sendMail({
            from: process.env.MERCHANT_EMAIL,
            to: email,
            subject,
            html,
        });
    } catch (error) {
        console.error('Email failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('SMTP credentials expired. Please update EMAIL_PASSWORD.');
        }
        throw new Error('Failed to send email. Please contact support.');
    }
};

const sendOTPEmail = async (to, otp) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset OTP</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 500px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; text-align: center; }
                .otp { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Use the following OTP to reset your password:</p>
                    <div class="otp">${otp}</div>
                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 CoZ Core. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    try {
        await transporter.sendMail({
            from: process.env.MERCHANT_EMAIL,
            to: to,
            subject: "Reset Password OTP",
            html,
        });
    } catch (error) {
        console.error('OTP Email failed:', error.message);
        throw new Error('Failed to send OTP email. Please try again later.');
    }
};

const sendOrderEmailToMerchant = async (order, cartItems, customerEmail, customerName) => {
    const itemsHtml = cartItems
        .map(
            (item) => `
                <li>
                    <strong>${item.product.name}</strong><br/>
                    color: ${item.color.name}<br/>
                    size: ${item.size}<br/>
                    quantity: ${item.quantity}<br/>
                    price: ${item.unitPrice} LE<br/>
                    total: ${item.totalPrice} LE
                </li>
            `,
        )
        .join("");
    const adminOrderLink = `${process.env.CORS_ORIGIN}admin/orders`;

    const html = `
        <h1>Order #${order._id}</h1>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <h2>Customer Details</h2>
        <p>
            <strong>Name:</strong> ${order.shippingAddress.fullName}<br/>
            <strong>Phone:</strong> ${order.shippingAddress.phone}<br/>
            <strong>Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.governorate}
            ${order.shippingAddress.apartment ? `, Apartment ${order.shippingAddress.apartment}` : ""}
            ${order.shippingAddress.postalCode ? `, Postal Code: ${order.shippingAddress.postalCode}` : ""}
        </p>
        <h2>Products</h2>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ${order.totalAmount} LE</p>
        <p><strong>Customer Notes:</strong> ${order.notes || "No notes"}</p>
        <hr/>
        <p>Please contact the customer to confirm the order.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="mailto:${customerEmail}?subject=Reply to your order ${order._id}"
                style="background-color: #000000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; display: inline-block;">
                Reply to Customer
            </a>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${adminOrderLink}"
                style="background-color: #000000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; display: inline-block;">
                View All Orders in Dashboard
            </a>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MERCHANT_EMAIL,
            to: process.env.MERCHANT_EMAIL,
            replyTo: `${customerName} <${customerEmail}>`,
            subject: `New Order #${order._id}`,
            html,
        });
    } catch (error) {
        console.error('Order email failed:', error.message);
        throw new Error('Failed to send order confirmation email.');
    }
};

const sendContactEmail = async ({ name, email, subject, message }) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>New Contact Message</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; }
                .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📩 New Contact Message</h1>
                </div>
                <div class="content">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
                    <hr/>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <div class="footer">
                    <p>This message was sent from your website's contact form.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.MERCHANT_EMAIL,
            to: process.env.MERCHANT_EMAIL,
            subject: `Contact: ${subject || 'New message from ' + name}`,
            html,
            replyTo: email,
        });
    } catch (error) {
        console.error('Contact email failed:', error.message);
        throw new Error('Failed to send contact message. Please try again later.');
    }
};

export {
    sendOTPEmail,
    sendOrderEmailToMerchant,
    sendVerificationEmail,
    sendContactEmail
};