// server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
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


// VERIFY PAYMENT
app.post("/api/verify-payment", async (req, res) => {
  const { reference, order } = req.body;

  if (!reference) {
    return res.status(400).json({ status: "error", message: "Missing reference" });
  }

  try {
    // Verify at Paystack
    const verifyURL = `https://api.paystack.co/transaction/verify/${reference}`;
    const paystackRes = await axios.get(verifyURL, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    });

    const status = paystackRes.data.data.status;

    if (status !== "success") {
      return res.status(400).json({ status: "error", message: "Payment not completed" });
    }

    // Now process the order + send emails (reuse your /api/order logic)
    const { contact, shipping, items, subtotal } = order;

    // 1️⃣ Send admin email
    await transporter.sendMail({
      from: process.env.ZOHO_USER,
      to: process.env.ZOHO_USER,
      subject: `New PAID Order from ${contact.email}`,
      html: `
        <h2>New Paid Order</h2>
        <p><strong>Payment Reference:</strong> ${reference}</p>
        <hr/>
        <h3>Customer Info</h3>
        <p>Email: ${contact.email}</p>
        <p>Phone: ${contact.phone}</p>
        <h3>Shipping Address</h3>
        <p>${shipping.firstName} ${shipping.lastName}</p>
        <p>${shipping.address}, ${shipping.city}, ${shipping.country}</p>
        <h3>Items</h3>
        <ul>${items
          .map(
            (i) =>
              `<li>${i.name} - ${i.size} x${i.quantity} = Ksh ${i.price * i.quantity}</li>`
          )
          .join("")}
        </ul>
        <h3>Total: Ksh ${subtotal}</h3>
      `,
    });

   await transporter.sendMail({
  from: process.env.ZOHO_USER,
  to: contact.email,
  subject: "Your KoolHeads Order — Payment Confirmed",
  html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>KoolHeads Order Confirmation</title>
    <style>
      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #111111;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        border-top: 4px solid #000;
      }
      h1, h2, h3 {
        margin: 0 0 15px 0;
        font-weight: 600;
      }
      p {
        margin: 0 0 15px 0;
        line-height: 1.5;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      li {
        padding: 5px 0;
        border-bottom: 1px solid #e0e0e0;
      }
      .total {
        font-weight: 700;
        margin-top: 15px;
        font-size: 16px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888888;
        text-align: center;
      }
      .brand {
        font-size: 28px;
        font-weight: 800;
        color: #000;
        text-align: center;
        margin-bottom: 30px;
        letter-spacing: 2px;
      }
      a {
        color: #000;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .container {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand">KoolHeads</div>

      <h2>Payment Successful 🎉</h2>
      <p>Hi ${shipping.firstName},</p>
      <p>Thank you for your order! Your payment was successfully processed and your order is now confirmed.</p>

      <p><strong>Reference:</strong> ${reference}</p>

      <h3>Order Summary</h3>
      <ul>
        ${items
          .map(
            (i) =>
              `<li>${i.name} - ${i.size} x${i.quantity} = Ksh ${i.price * i.quantity}</li>`
          )
          .join("")}
      </ul>

      <p class="total">Total Paid: Ksh ${subtotal}</p>

      <p>We will notify you once your order is shipped. For any questions, feel free to <a href="mailto:support@koolheads.com">contact us</a>.</p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} KoolHeads. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `,
});

    return res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Verification error:", err.response?.data || err);
    return res.status(500).json({ status: "error", message: "Verification failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
