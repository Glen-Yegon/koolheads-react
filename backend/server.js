// server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter for Zoho (production-ready)
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,          // STARTTLS port
  secure: false,      // STARTTLS
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS, // your Zoho app password
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs (safe for dev)
  },
});

// Test transporter
transporter.verify((error, success) => {
  if (error) console.log("Transporter error:", error);
  else console.log("Server ready to send emails");
});

// Endpoint to receive order
app.post("/api/order", async (req, res) => {
  try {
    const { contact, shipping, items, subtotal } = req.body;

    if (!contact || !shipping || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // 1️⃣ Email to admin
    const adminMailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.ZOHO_USER,
      subject: `New Order from ${contact.email}`,
      html: `
        <h2>New Order Received</h2>
        <h3>Contact Info</h3>
        <p>Email: ${contact.email}</p>
        <p>Phone: ${contact.phone}</p>
        <h3>Shipping Info</h3>
        <p>${shipping.firstName} ${shipping.lastName}</p>
        <p>${shipping.address} ${shipping.apartment || ""}</p>
        <p>${shipping.city}, ${shipping.country}</p>
        <p>Postal: ${shipping.postal || "N/A"}</p>
        <p>Shipping Method: ${shipping.shippingMethod}</p>
        <h3>Order Items</h3>
        <ul>
          ${items
            .map(
              (i) =>
                `<li>${i.name} - ${i.size} x${i.quantity} = Ksh ${
                  i.price * i.quantity
                }</li>`
            )
            .join("")}
        </ul>
        <h3>Subtotal: Ksh ${subtotal}</h3>
      `,
    };

    await transporter.sendMail(adminMailOptions).catch((err) => {
      console.error("Error sending admin email:", err);
    });

    // 2️⃣ Autoresponse to customer
    const customerMailOptions = {
      from: process.env.ZOHO_USER,
      to: contact.email,
      subject: "Your Order Confirmation",
      html: `
        <h2>Thanks for your order!</h2>
        <p>Hi ${shipping.firstName},</p>
        <p>We’ve received your order and are processing it.</p>
        <h3>Order Summary</h3>
        <ul>
          ${items
            .map(
              (i) =>
                `<li>${i.name} - ${i.size} x${i.quantity} = Ksh ${
                  i.price * i.quantity
                }</li>`
            )
            .join("")}
        </ul>
        <p>Subtotal: Ksh ${subtotal}</p>
        <p>We will notify you once your order is shipped.</p>
        <p>Thanks, <br/> Koolheads Team</p>
      `,
    };

    await transporter.sendMail(customerMailOptions).catch((err) => {
      console.error("Error sending customer email:", err);
    });

    return res.status(200).json({ message: "Order successfully sent" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
