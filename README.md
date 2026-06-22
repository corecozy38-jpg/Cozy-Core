# 🛒 CozyCore - E-Commerce Platform

A full-featured e-commerce platform for streetwear and athletic apparel, built with a modern full-stack architecture and an automated translation system using Google Gemini AI. The platform supports both Arabic and English with a seamless admin panel.

---

## 📖 Overview

CozyCore is a complete e-commerce solution designed for emerging fashion brands. It provides a smooth shopping experience with dual-language support (Arabic/English), automated content translation, and a powerful admin dashboard to manage products, orders, inventory, and users.

The platform's standout feature is its **automatic translation system** powered by Google Gemini API. Admins enter content in English, and the backend automatically translates it to Arabic, ensuring consistent bilingual content with minimal effort.

---

## ✨ Key Features

### 👤 User / Guest Experience
- **Product Browsing**: Advanced filtering by collection, size, color, price range, and availability
- **Product Details**: Image gallery, color/size selection, size guide, and quantity picker
- **Shopping Cart**: Persistent cart for both registered users and guests
- **Checkout & Ordering**: Place orders with automatic stock reduction and merchant email notifications
- **User Accounts**: Registration, email verification, password reset (OTP), and order history
- **Product Reviews**: Write reviews with image uploads (up to 5 images) and view them in a clean layout
- **Bilingual Interface**: Full Arabic/English support with instant language switching

### 👨‍💼 Admin Dashboard
- **Analytics Dashboard**: View total orders, revenue, users, products, pending reviews, and a sales chart
- **Product Management**: Add, edit, and delete products with multi-image support for each color variant
- **Order Management**: View all orders, filter by status (pending, completed, cancelled), and update order status with automatic stock restoration
- **Review Management**: Approve or reject reviews, and mark reviews as "Featured" to display on the homepage
- **User Management**: View users, change roles (User/Admin), and delete users
- **FAQ Management**: Add/edit FAQs with automatic Arabic translation
- **Content Management**: Control static pages (About, Contact, Order Guide, Terms & Conditions) with flexible item-based editing

---

## 🛠️ Tech Stack

### Frontend
- **Angular 20**: Framework (Standalone Components, Signals)
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Responsive, utility-first styling
- **Chart.js**: Dashboard charts
- **ngx-translate**: Bilingual support
- **Font Awesome**: Icons

### Backend
- **Node.js & Express.js**: RESTful API
- **MongoDB & Mongoose**: Database & ODM
- **JWT**: Authentication & route protection
- **Nodemailer (SMTP - Gmail)**: Email delivery (verification, OTP, orders, contact)
- **Multer & Cloudinary**: Image upload & management
- **Google Gemini API**: Automatic content translation (English → Arabic)
- **Redis (Optional)**: Caching layer

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image hosting)
- Gmail account with App Password enabled
