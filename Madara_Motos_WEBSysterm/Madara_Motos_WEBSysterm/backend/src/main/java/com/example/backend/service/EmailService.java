package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.PurchaseOrder;
import com.example.backend.entity.PurchaseOrderItem;
import com.example.backend.entity.SparePart;
import com.example.backend.repository.SparePartRepository;
import com.lowagie.text.DocumentException;
import org.springframework.core.io.ByteArrayResource;
import org.xhtmlrenderer.pdf.ITextRenderer;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // =============================================
    // =============================================
    private String buildHtmlTemplate(String subtitle, String content) {
        return "<div style='font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>" +

                // 🔵 Header
                "<div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 20px; text-align: center; border-bottom: 4px solid #f97316;'>" +
                "<h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;'>Madara<span style='color: #f97316;'>Motors</span></h1>" +
                "<p style='color: #94a3b8; margin: 8px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;'>" + subtitle + "</p>" +
                "</div>" +

                // ⚪ Body (Dynamic Content)
                "<div style='padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.6; font-size: 15px;'>" +
                content +
                "</div>" +

                // 🔘 Footer
                "<div style='background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;'>" +
                "<p style='margin: 0; color: #475569; font-size: 14px; font-weight: bold;'>Thank you for choosing Madara Motors!</p>" +
                "<p style='margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;'>📞 +94 76 992 4173  |  ✉️ madaramotors383@gmail.com</p>" +
                "<p style='margin: 10px 0 0 0; color: #cbd5e1; font-size: 11px;'>Puththal Rd, Wariyapola.</p>" +
                "<p style='margin: 5px 0 0 0; color: #cbd5e1; font-size: 11px;'>© 2026 Madara Motors. All rights reserved.</p>" +
                "</div>" +

                "</div>";
    }

    // =============================================
    // 1. Admin Login OTP
    // =============================================
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String content = "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Hello Admin 👋</h2>" +
                "<p style='color: #475569;'>A secure login attempt was made to your administrative account. Please use the following One-Time Password (OTP) to sign in.</p>" +
                "<div style='background-color: #eff6ff; border: 2px dashed #3b82f6; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0;'>" +
                "<span style='font-size: 36px; font-weight: 900; color: #1d4ed8; letter-spacing: 10px;'>" + otp + "</span>" +
                "</div>" +
                "<p style='font-size: 13px; color: #ef4444; margin: 0; text-align: center; background: #fef2f2; padding: 10px; border-radius: 8px;'>⚠️ This code is valid for exactly <strong>5 minutes</strong>.</p>";

        sendHtmlMail(toEmail, "Madara Motors - Admin Login OTP", buildHtmlTemplate("System Security", content));
    }

    // =============================================
    // 2. Admin Resend OTP
    // =============================================
    @Async
    public void sendResendOtpEmail(String toEmail, String otp) {
        String content = "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Hello Admin 🔄</h2>" +
                "<p style='color: #475569;'>You have requested a new OTP. Please use the updated code below to proceed securely.</p>" +
                "<div style='background-color: #fff7ed; border: 2px dashed #f97316; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0;'>" +
                "<span style='font-size: 36px; font-weight: 900; color: #c2410c; letter-spacing: 10px;'>" + otp + "</span>" +
                "</div>" +
                "<p style='font-size: 13px; color: #ef4444; margin: 0; text-align: center; background: #fef2f2; padding: 10px; border-radius: 8px;'>⚠️ This new code is valid for exactly <strong>5 minutes</strong>.</p>";

        sendHtmlMail(toEmail, "Madara Motors - New OTP Requested", buildHtmlTemplate("System Security", content));
    }

    // =============================================
    // 3. Customer Registration OTP
    // =============================================
    @Async
    public void sendCustomerOtpEmail(String toEmail, String name, String otp) {
        String content = "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Welcome, " + name + "! 🎉</h2>" +
                "<p style='color: #475569;'>To complete your registration and verify your email address, please enter the following OTP code.</p>" +
                "<div style='background-color: #f0fdf4; border: 2px dashed #10b981; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0;'>" +
                "<span style='font-size: 36px; font-weight: 900; color: #047857; letter-spacing: 10px;'>" + otp + "</span>" +
                "</div>" +
                "<p style='font-size: 13px; color: #64748b; margin: 0; text-align: center;'>⏰ This OTP is valid for <strong>10 minutes</strong>. If you did not create this account, please ignore this email.</p>";

        sendHtmlMail(toEmail, "Madara Motors - Verify Your Email", buildHtmlTemplate("Account Verification", content));
    }

    // =============================================
    // 4. Customer Resend OTP
    // =============================================
    @Async
    public void sendCustomerResendOtpEmail(String toEmail, String name, String otp) {
        String content = "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Hello " + name + ",</h2>" +
                "<p style='color: #475569;'>Here is your newly generated OTP for email verification at Madara Motors.</p>" +
                "<div style='background-color: #f0fdf4; border: 2px dashed #10b981; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0;'>" +
                "<span style='font-size: 36px; font-weight: 900; color: #047857; letter-spacing: 10px;'>" + otp + "</span>" +
                "</div>" +
                "<p style='font-size: 13px; color: #64748b; margin: 0; text-align: center;'>⏰ This new code is valid for <strong>10 minutes</strong>.</p>";

        sendHtmlMail(toEmail, "Madara Motors - New Verification OTP", buildHtmlTemplate("Account Verification", content));
    }

    // =============================================
    // 5. Welcome Email (First Login)
    // =============================================
    @Async
    public void sendWelcomeEmail(String toEmail, String name, String provider) {
        String providerText = "Email & Password";
        String badgeColor = "#64748b";
        if (provider.equals("GOOGLE")) { providerText = "Google Account"; badgeColor = "#ea4335"; }
        else if (provider.equals("FACEBOOK")) { providerText = "Facebook Account"; badgeColor = "#1877f2"; }

        String content = "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Welcome aboard, " + name + "! 🚀</h2>" +
                "<p style='color: #475569;'>Your Madara Motors account has been successfully created and activated. You signed in securely using: <span style='background-color: " + badgeColor + "; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 5px; display: inline-block;'>" + providerText + "</span></p>" +

                "<div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 30px 0;'>" +
                "<h3 style='margin: 0 0 15px 0; color: #0f172a; font-size: 16px;'>What you can do now:</h3>" +
                "<ul style='margin: 0; padding-left: 20px; color: #475569; line-height: 1.8; font-size: 14px;'>" +
                "<li>Browse thousands of genuine spare parts 🏍️</li>" +
                "<li>Order parts online with easy pickup options 📦</li>" +
                "<li>Track your orders in real-time ⏳</li>" +
                "<li>Get exclusive deals and special offers 💸</li>" +
                "</ul>" +
                "</div>" +

                "<div style='text-align: center; margin-top: 35px;'>" +
                "<a href='http://localhost:5173' style='background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);'>🛒 Go to Store</a>" +
                "</div>";

        sendHtmlMail(toEmail, "Welcome to Madara Motors! 🎉", buildHtmlTemplate("Account Activated", content));
    }

    // =============================================
    // 6. Order Ready Email (COMPLETED)
    // =============================================
    @Async
    public void sendOrderReadyEmail(Order order) {
        StringBuilder content = new StringBuilder();

        content.append("<h2 style='color: #1e293b; margin-top: 0; font-size: 24px;'>Hello ").append(order.getCustomerName()).append(",</h2>");
        content.append("<p style='color: #475569; font-size: 16px;'>Great news! Your order <strong style='color: #f97316; font-size: 18px; padding: 2px 8px; background: #fff7ed; border-radius: 6px;'>#ORD-").append(order.getId()).append("</strong> has been completed and is now ready to be picked up from our store.</p>");

        // 📦 Order Items Table
        content.append("<table style='width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);'>");
        content.append("<tr style='background-color: #f1f5f9; text-align: left; color: #334155;'>");
        content.append("<th style='padding: 15px; border-radius: 8px 0 0 0; border-bottom: 2px solid #cbd5e1;'>Item Details</th>");
        content.append("<th style='padding: 15px; text-align: center; border-bottom: 2px solid #cbd5e1;'>Qty</th>");
        content.append("<th style='padding: 15px; text-align: right; border-radius: 0 8px 0 0; border-bottom: 2px solid #cbd5e1;'>Subtotal</th>");
        content.append("</tr>");

        // 🟢 Null Pointer Fix එක මෙතන දාලා තියෙන්නේ
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                content.append("<tr style='border-bottom: 1px solid #e2e8f0; background: #fff;'>");
                content.append("<td style='padding: 15px;'><strong style='color: #0f172a; display: block; font-size: 15px;'>").append(item.getProductName()).append("</strong><span style='font-size: 12px; color: #94a3b8; margin-top: 4px; display: block;'>Code: ").append(item.getProductCode()).append("</span></td>");
                content.append("<td style='padding: 15px; text-align: center; color: #0f172a; font-weight: bold; font-size: 15px;'>").append(item.getQuantity()).append("</td>");
                content.append("<td style='padding: 15px; text-align: right; color: #475569; font-weight: 500;'>Rs. ").append(String.format("%,.2f", item.getPrice())).append("</td>");
                content.append("</tr>");
            }
        }
        content.append("</table>");

        // 💰 Total Amount
        content.append("<div style='text-align: right; margin-bottom: 35px; padding: 20px; background: linear-gradient(to right, #ffffff, #f8fafc); border-radius: 8px; border: 1px solid #e2e8f0;'>");
        content.append("<span style='color: #64748b; font-size: 16px; font-weight: bold; margin-right: 10px;'>Net Total: </span><strong style='color: #0f172a; font-size: 26px;'>Rs. ").append(String.format("%,.2f", order.getTotalAmount())).append("</strong>");
        content.append("</div>");

        // ⚠️ 7-Day Warning Box
        content.append("<div style='background-color: #fffbeb; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;'>");
        content.append("<h4 style='margin: 0 0 10px 0; color: #b45309; font-size: 16px; display: flex; align-items: center;'>⚠️ Important Pickup Instructions</h4>");
        content.append("<p style='margin: 0 0 8px 0; font-size: 14px; color: #92400e; line-height: 1.6;'>Please pick up your order within <strong style='background: #fde68a; padding: 2px 6px; border-radius: 4px;'>7 Days</strong>. If the order is not collected within this timeframe, it will be <strong>automatically cancelled</strong> by our system.</p>");
        content.append("<p style='margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;'>If you are unable to visit within 7 days, please call us at <strong>+94 76 992 4173</strong> immediately to hold your items.</p>");
        content.append("</div>");

        // 📍 Clickable Google Maps Image Section
        content.append("<div style='text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px dashed #cbd5e1;'>");
        content.append("<p style='color: #475569; font-size: 15px; font-weight: bold; margin-bottom: 20px;'>How to find us (Click Map for Directions):</p>");
        String mapImageUrl = "https://developers.google.com/static/maps/images/landing/hero_maps_static_api.png";
        content.append("<a href='https://maps.app.goo.gl/wwYHMoLcJPuR8fNw6' target='_blank' style='display: block; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 4px solid #f8fafc; text-decoration: none; max-width: 500px; margin: 0 auto; transition: transform 0.2s;'>");
        content.append("<img src='").append(mapImageUrl).append("' alt='Madara Motors Location Map' style='width: 100%; height: auto; display: block; margin: 0;' />");
        content.append("</a>");
        content.append("</div>");

        sendHtmlMail(order.getCustomerEmail(), "Your Order is Ready for Pickup! 🏍️ - Madara Motors (#ORD-" + order.getId() + ")", buildHtmlTemplate("Ready For Pickup", content.toString()));
    }

    // =============================================
    // 7. Order Picked Up Email
    // =============================================
    @Async
    public void sendOrderPickedUpEmail(Order order) {
        StringBuilder content = new StringBuilder();

        // 🌟 Greeting & Success Badge
        content.append("<div style='text-align: center; margin-bottom: 30px;'>");
        content.append("<span style='background-color: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #86efac;'>✔ Successfully Picked Up</span>");
        content.append("</div>");

        content.append("<h2 style='color: #1e293b; margin-top: 0; font-size: 24px; text-align: center;'>Hi ").append(order.getCustomerName()).append(",</h2>");
        content.append("<p style='color: #475569; font-size: 16px; text-align: center; line-height: 1.6;'>This email is to confirm that your order <strong style='color: #f97316; font-size: 18px;'>#ORD-").append(order.getId()).append("</strong> has been successfully picked up from our store. Thank you for doing business with Madara Motors!</p>");

        // 📦 Order Summary Section
        content.append("<div style='background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 35px 0; border: 1px solid #e2e8f0;'>");
        content.append("<h3 style='margin: 0 0 15px 0; color: #0f172a; font-size: 16px; border-bottom: 2px dashed #cbd5e1; padding-bottom: 10px;'>Your Order Summary</h3>");

        content.append("<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>");

        // 🟢 Null Pointer Fix එක මෙතන දාලා තියෙන්නේ
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                content.append("<tr>");
                content.append("<td style='padding: 10px 0; color: #475569; border-bottom: 1px solid #e2e8f0;'>").append(item.getProductName()).append(" <strong style='color:#1e293b;'>(x").append(item.getQuantity()).append(")</strong></td>");
                content.append("<td style='padding: 10px 0; text-align: right; color: #1e293b; font-weight: bold; border-bottom: 1px solid #e2e8f0;'>LKR ").append(String.format("%,.2f", item.getPrice() * item.getQuantity())).append("</td>");
                content.append("</tr>");
            }
        }
        content.append("</table>");

        // 💰 Total Paid
        content.append("<div style='display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; font-size: 18px; font-weight: 900;'>");
        content.append("<span style='color: #1e293b;'>Total Paid:</span>");
        content.append("<span style='color: #10b981;'>LKR ").append(String.format("%,.2f", order.getTotalAmount())).append("</span>");
        content.append("</div>");
        content.append("</div>");

        // 👋 Thank You Note
        content.append("<p style='font-size: 15px; line-height: 1.6; color: #475569; text-align: center; margin-top: 30px;'>");
        content.append("We hope you enjoy your new items! If you have any questions or need further assistance, our support team is always here to help. <br><br><strong>Ride Safe! 🏍️</strong>");
        content.append("</p>");
        sendHtmlMail(order.getCustomerEmail(), "Order Picked Up! Receipt for #ORD-" + order.getId(), buildHtmlTemplate("Order Handover Confirmation", content.toString()));
    }


    // =============================================
    // 8. 🔥 CUSTOMER FORGOT PASSWORD OTP (NEW)
    // =============================================
    @Async
    public void sendCustomerPasswordResetOtpEmail(String toEmail, String name, String otp) {
        String content = "<div style='text-align: center; margin-bottom: 25px;'>" +
                "<div style='background-color: #fff7ed; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;'>" +
                "<span style='font-size: 28px;'>🔐</span>" +
                "</div>" +
                "</div>" +

                "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px; text-align: center;'>Password Reset Request</h2>" +
                "<p style='color: #475569; text-align: center; line-height: 1.6;'>Hello <strong style='color: #1e293b;'>" + name + "</strong>,<br>We received a request to reset the password associated with your Madara Motors account. Please use the verification code below to proceed.</p>" +

                "<div style='background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #f97316; padding: 25px; text-align: center; border-radius: 12px; margin: 35px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'>" +
                "<p style='color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; font-weight: bold;'>Your Verification Code</p>" +
                "<span style='font-size: 42px; font-weight: 900; color: #ffffff; letter-spacing: 12px;'>" + otp + "</span>" +
                "</div>" +

                "<div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;'>" +
                "<p style='font-size: 13px; color: #92400e; margin: 0; line-height: 1.5;'>⏳ For your security, this code will expire in <strong>10 minutes</strong>.</p>" +
                "<p style='font-size: 13px; color: #92400e; margin: 8px 0 0 0; line-height: 1.5;'>⚠️ If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>" +
                "</div>";

        sendHtmlMail(toEmail, "Madara Motors - Password Reset Code", buildHtmlTemplate("Account Recovery", content));
    }


    // =============================================
    // CORE METHOD: Send HTML MimeMessage
    // =============================================
    private void sendHtmlMail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(senderEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
            System.out.println("✅ Custom HTML Email sent successfully to: " + to);

        } catch (Exception e) {
            System.err.println("❌ Email Error: " + e.getMessage());
        }
    }

    // =============================================
    // =============================================
    @Async // 🟢 මේක ආයෙත් දැම්මා! එතකොට Lag වෙන්නේ නෑ.
    public void sendPurchaseOrderEmail(PurchaseOrder order) {

        try {
            String formattedPoNumber = LocalDate.now().toString() + "-" + String.format("%03d", order.getId());
            StringBuilder html = new StringBuilder();
            html.append("<html><head><style>");
            html.append("body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; margin: 0; padding: 0; }");
            html.append(".container { padding: 40px; }");
            html.append(".header-box { border-bottom: 3px solid #f97316; padding-bottom: 15px; margin-bottom: 30px; }");
            html.append(".header-title { color: #0f172a; font-size: 28px; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }");
            html.append(".header-title span { color: #f97316; }");
            html.append(".subtitle { color: #64748b; font-size: 13px; margin-top: 5px; }");

            html.append("table.info-table { width: 100%; margin-bottom: 30px; }");
            html.append("table.info-table td { vertical-align: top; width: 50%; }");
            html.append(".box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }");
            html.append(".box h3 { margin-top: 0; color: #1e293b; font-size: 14px; text-transform: uppercase; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; }");

            html.append("table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }");
            html.append("table.items-table th { background-color: #0f172a; color: #ffffff; padding: 12px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }");
            html.append("table.items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; }");
            html.append("table.items-table tr:nth-child(even) { background-color: #f8fafc; }");

            html.append(".footer-note { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; color: #b45309; font-size: 13px; }");
            html.append(".footer-sign { margin-top: 40px; color: #94a3b8; font-size: 11px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }");
            html.append("</style></head><body>");

            html.append("<div class='container'>");

            // 🔵 Header
            html.append("<div class='header-box'>");
            html.append("<div class='header-title'>Madara<span>Motors</span></div>");
            html.append("<div class='subtitle'>Official Purchase Order Request</div>");
            html.append("</div>");

            // 🔵 Order & Supplier Info
            html.append("<table class='info-table'><tr>");

            // Left Column: Supplier Info
            html.append("<td style='padding-right: 15px;'><div class='box'>");
            html.append("<h3>Purchase Order To:</h3>");
            html.append("<strong style='font-size: 16px; color: #3b82f6;'>").append(order.getSupplier().getSupplierName()).append("</strong><br/>");
            if(order.getSupplier().getCompany() != null && !order.getSupplier().getCompany().isEmpty()) {
                html.append("<span style='color: #64748b;'>").append(order.getSupplier().getCompany()).append("</span><br/>");
            }
            html.append("<div style='margin-top: 8px;'>Email: <strong>").append(order.getSupplier().getEmail()).append("</strong></div>");
            html.append("<div>Phone: <strong>").append(order.getSupplier().getContactNumber()).append("</strong></div>");
            html.append("</div></td>");

            // Right Column: Order Details
            html.append("<td style='padding-left: 15px;'><div class='box' style='text-align: right;'>");
            html.append("<h2 style='margin: 0 0 10px 0; color: #0f172a; font-size: 20px;'>PO #").append(formattedPoNumber).append("</h2>");
            html.append("<div>Date: <strong>").append(LocalDate.now().toString()).append("</strong></div>");
            html.append("<div>Status: <strong style='color: #f59e0b;'>URGENT RESTOCK</strong></div>");
            html.append("</div></td>");

            html.append("</tr></table>");

            // 🔵 Items Table
            html.append("<table class='items-table'>");
            html.append("<tr>");
            html.append("<th style='width: 5%; text-align: center;'>#</th>");
            html.append("<th style='width: 15%;'>Item Code</th>");
            html.append("<th style='width: 25%;'>Product Name</th>");
            html.append("<th style='width: 15%; text-align: center;'>Category</th>");
            html.append("<th style='width: 15%; text-align: center;'>Vehicle</th>");
            html.append("<th style='width: 15%; text-align: center;'>Brand</th>");

            html.append("<th style='width: 10%; text-align: center;'>Req Qty</th>");
            html.append("</tr>");

            if (order.getItems() != null) {
                int count = 1;
                for (PurchaseOrderItem item : order.getItems()) {

                    String productCode = item.getSparePart().getProductCode();
                    String productName = "Unknown Item";
                    String category = "N/A";
                    String vehicle = "N/A";
                    String brand = "N/A";
                    SparePart dbPart = sparePartRepository.findById(productCode).orElse(null);
                    if(dbPart != null) {
                        productName = dbPart.getProductName();
                        category = dbPart.getPartCategory() != null ? dbPart.getPartCategory() : "N/A";
                        vehicle = dbPart.getVehicleType() != null ? dbPart.getVehicleType() : "N/A";
                        brand = dbPart.getBrand() != null ? dbPart.getBrand() : "N/A";
                    }

                    html.append("<tr>");
                    html.append("<td style='text-align: center; color: #94a3b8;'>").append(count++).append("</td>");
                    html.append("<td style='color: #3b82f6; font-weight: bold;'>").append(productCode).append("</td>");
                    html.append("<td style='font-weight: 600;'>").append(productName).append("</td>");
                    html.append("<td style='text-align: center; font-size: 12px;'>").append(category).append("</td>");
                    html.append("<td style='text-align: center; font-size: 12px;'>").append(vehicle).append("</td>");
                    html.append("<td style='text-align: center; font-size: 12px;'>").append(brand).append("</td>");

                    html.append("<td style='text-align: center; font-size: 15px; font-weight: 900; color: #0f172a;'>").append(item.getQuantity()).append("</td>");
                    html.append("</tr>");
                }
            }

            html.append("</table>");

            // 🔵 Footer Note
            html.append("<div class='footer-note'>");
            html.append("<strong>Special Instructions:</strong> Please confirm the receipt of this Purchase Order and provide us with an estimated delivery date. Ensure all items are delivered in good condition.");
            html.append("</div>");

            html.append("<div class='footer-sign'>");
            html.append("This is a computer-generated document. No physical signature is required.<br/>");
            html.append("Madara Motors | +94 77 123 4567 | Puththal Rd, Wariyapola");
            html.append("</div>");

            html.append("</div></body></html>");
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html.toString());
            renderer.layout();
            renderer.createPDF(outputStream);
            outputStream.close();
            String emailBodyContent =
                    "<h2 style='color: #1e293b; margin-top: 0; font-size: 22px;'>Hello " + order.getSupplier().getSupplierName() + " 👋</h2>" +
                            "<p style='color: #475569;'>Please find attached our latest Purchase Order request <strong style='color: #f97316; font-size: 16px;'>#" + formattedPoNumber + "</strong> from Madara Motors.</p>" +
                            "<div style='background-color: #eff6ff; border: 2px dashed #3b82f6; padding: 20px; border-radius: 12px; margin: 25px 0;'>" +
                            "<h4 style='color: #1d4ed8; margin: 0 0 10px 0; font-size: 16px;'>Action Required:</h4>" +
                            "<ul style='margin: 0; padding-left: 20px; color: #1e293b; line-height: 1.6; font-size: 14px;'>" +
                            "<li>Review the attached PDF document for the requested items and quantities.</li>" +
                            "<li>Confirm the receipt of this Purchase Order.</li>" +
                            "<li>Arrange the delivery as soon as possible.</li>" +
                            "</ul>" +
                            "</div>" +
                            "<p style='font-size: 14px; color: #64748b; margin: 0;'>If you have any questions, please reply to this email or contact us directly.</p>";
            String fullHtmlEmail = buildHtmlTemplate("Official Purchase Order", emailBodyContent);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "Manager - Madara Motors");
            helper.setTo(order.getSupplier().getEmail());
            helper.setSubject("URGENT: Purchase Order #" + formattedPoNumber + " - Madara Motors");
            helper.setText(fullHtmlEmail, true); // true = HTML
            ByteArrayResource pdfAttachment = new ByteArrayResource(outputStream.toByteArray());
            helper.addAttachment("Purchase_Order_" + formattedPoNumber + ".pdf", pdfAttachment);
            mailSender.send(message);
            System.out.println("✅ Purchase Order PDF Email sent successfully to: " + order.getSupplier().getEmail());

        } catch (Exception e) {
            System.err.println("❌ Background Email Sending Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}