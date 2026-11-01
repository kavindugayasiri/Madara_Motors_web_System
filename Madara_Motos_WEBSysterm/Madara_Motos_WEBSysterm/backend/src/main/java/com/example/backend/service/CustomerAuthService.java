package com.example.backend.service;

import com.example.backend.dto.CustomerAuthResponse;
import com.example.backend.dto.CustomerRegisterRequest;
import com.example.backend.entity.Customer;
import com.example.backend.entity.CustomerOtp;
import com.example.backend.repository.CustomerOtpRepository;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class CustomerAuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // =========================================
    // 1. REGISTER + OTP SEND
    // =========================================
    public String registerAndSendOtp(CustomerRegisterRequest req) {

        if (customerRepository.existsByEmail(req.getEmail())) {

            Optional<Customer> existingOpt =
                    customerRepository.findByEmail(req.getEmail());

            if (existingOpt.isPresent()) {
                Customer existing = existingOpt.get();

                if (!existing.isEmailVerified()) {
                    generateAndSendOtp(
                            existing.getEmail(),
                            existing.getName()
                    );
                    return "OTP resent to " + req.getEmail();
                }
            }
            throw new RuntimeException("Email already registered!");
        }

        Customer customer = new Customer();
        customer.setName(req.getName());
        customer.setEmail(req.getEmail());
        customer.setPhone(req.getPhone());
        customer.setAddress(req.getAddress());
        customer.setPassword(passwordEncoder.encode(req.getPassword()));
        customer.setEmailVerified(false);
        customer.setProvider("LOCAL");
        customer.setLoginCount(0);
        customerRepository.save(customer);

        generateAndSendOtp(req.getEmail(), req.getName());

        return "OTP sent to " + req.getEmail();
    }

    // =========================================
    // 2. OTP GENERATE + EMAIL SEND
    // =========================================
    private void generateAndSendOtp(String email, String name) {

        otpRepository.deleteByEmail(email);

        String otp = String.format(
                "%06d", new Random().nextInt(999999)
        );

        CustomerOtp otpEntity = new CustomerOtp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpEntity.setUsed(false);
        otpRepository.save(otpEntity);

        emailService.sendCustomerOtpEmail(email, name, otp);

        System.out.println("✅ OTP for [" + email + "] : " + otp);
    }

    // =========================================
    // 3. OTP VERIFY + JWT TOKEN RETURN
    // =========================================
    public CustomerAuthResponse verifyOtpAndLogin(
            String email, String otpCode) {

        CustomerOtp otpEntity = otpRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException(
                        "OTP not found! Please register again."
                ));

        if (otpEntity.isUsed()) {
            throw new RuntimeException("OTP already used!");
        }

        if (LocalDateTime.now().isAfter(otpEntity.getExpiresAt())) {
            throw new RuntimeException(
                    "OTP expired! Please click Resend OTP."
            );
        }

        if (!otpEntity.getOtp().equals(otpCode)) {
            throw new RuntimeException(
                    "Invalid OTP! Please try again."
            );
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found!"
                ));

        customer.setEmailVerified(true);
        customerRepository.save(customer);

        // ✅ OTP verify - Welcome email
        try {
            emailService.sendWelcomeEmail(
                    email,
                    customer.getName(),
                    "LOCAL"
            );
            System.out.println("✅ Welcome email sent: " + email);
        } catch (Exception emailEx) {
            System.err.println(
                    "⚠️ Welcome email failed: " + emailEx.getMessage()
            );
        }

        String token = jwtUtil.generateToken(
                email,
                customer.getId(),
                "CUSTOMER"
        );

        System.out.println("✅ Customer verified: " + email);

        return CustomerAuthResponse.of(token, customer);
    }

    // =========================================
    // 4. RESEND OTP
    // =========================================
    public void resendOtp(String email) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Email not registered!"
                ));

        if (customer.isEmailVerified()) {
            throw new RuntimeException("Email already verified!");
        }

        generateAndSendOtp(email, customer.getName());
    }

    // =========================================
    // 5. ✅ CUSTOMER LOGIN - Welcome Email
    // =========================================
    public CustomerAuthResponse login(String email, String password) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid email or password!"
                ));

        if (!customer.isEmailVerified()) {
            throw new RuntimeException(
                    "Please verify your email first!"
            );
        }

        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new RuntimeException(
                    "Invalid email or password!"
            );
        }

        // ✅ First time login check
        boolean isFirstLogin =
                (customer.getLoginCount() == null ||
                        customer.getLoginCount() == 0);

        // Login count +1
        int currentCount = customer.getLoginCount() == null
                ? 0 : customer.getLoginCount();
        customer.setLoginCount(currentCount + 1);
        customerRepository.save(customer);

        // ✅ First login - Welcome email
        if (isFirstLogin) {
            try {
                emailService.sendWelcomeEmail(
                        email,
                        customer.getName(),
                        "LOCAL"
                );
                System.out.println(
                        "✅ Welcome email sent: " + email
                );
            } catch (Exception emailEx) {
                System.err.println(
                        "⚠️ Welcome email failed: " +
                                emailEx.getMessage()
                );
            }
        }

        String token = jwtUtil.generateToken(
                email,
                customer.getId(),
                "CUSTOMER"
        );

        System.out.println("✅ Customer logged in: " + email);

        return CustomerAuthResponse.of(token, customer);
    }

    // =========================================
    // 6. ✅ GOOGLE LOGIN
    // =========================================
    public CustomerAuthResponse loginWithGoogle(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> googleRes = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> userInfo = googleRes.getBody();

            if (userInfo == null) {
                throw new RuntimeException(
                        "Failed to get Google user info"
                );
            }

            String email = (String) userInfo.get("email");
            String name  = (String) userInfo.get("name");

            if (email == null) {
                throw new RuntimeException(
                        "Email not found in Google response"
                );
            }

            Customer customer = customerRepository
                    .findByEmail(email)
                    .orElse(null);

            boolean isNewCustomer = (customer == null);

            if (isNewCustomer) {
                customer = new Customer();
                customer.setName(name != null ? name : email);
                customer.setEmail(email);
                customer.setPhone("");
                customer.setAddress("");
                customer.setPassword(
                        passwordEncoder.encode(
                                UUID.randomUUID().toString()
                        )
                );
                customer.setEmailVerified(true);
                customer.setProvider("GOOGLE");
                customer.setLoginCount(1);
                customerRepository.save(customer);

                System.out.println("✅ New Google customer: " + email);

                // ✅ Welcome email
                try {
                    emailService.sendWelcomeEmail(
                            email,
                            customer.getName(),
                            "GOOGLE"
                    );
                    System.out.println(
                            "✅ Welcome email sent: " + email
                    );
                } catch (Exception emailEx) {
                    System.err.println(
                            "⚠️ Welcome email failed: " +
                                    emailEx.getMessage()
                    );
                }

            } else {
                // Existing - login count update
                int count = customer.getLoginCount() == null
                        ? 0 : customer.getLoginCount();
                customer.setLoginCount(count + 1);
                customerRepository.save(customer);
                System.out.println("✅ Google login: " + email);
            }

            String token = jwtUtil.generateToken(
                    email,
                    customer.getId(),
                    "CUSTOMER"
            );

            return CustomerAuthResponse.of(token, customer);

        } catch (Exception e) {
            System.err.println("❌ Google auth error: " + e.getMessage());
            throw new RuntimeException(
                    "Google authentication failed: " + e.getMessage()
            );
        }
    }

    // =========================================
    // 7. ✅ FACEBOOK LOGIN
    // =========================================
    public CustomerAuthResponse loginWithFacebook(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String fbUrl =
                    "https://graph.facebook.com/me" +
                            "?fields=id,name,email" +
                            "&access_token=" + accessToken;

            ResponseEntity<Map> fbRes = restTemplate.getForEntity(
                    fbUrl,
                    Map.class
            );

            Map<String, Object> userInfo = fbRes.getBody();

            if (userInfo == null) {
                throw new RuntimeException(
                        "Failed to get Facebook user info"
                );
            }

            String email = (String) userInfo.get("email");
            String name  = (String) userInfo.get("name");
            String fbId  = (String) userInfo.get("id");

            if (email == null || email.isEmpty()) {
                email = fbId + "@facebook.com";
            }

            Customer customer = customerRepository
                    .findByEmail(email)
                    .orElse(null);

            boolean isNewCustomer = (customer == null);

            if (isNewCustomer) {
                customer = new Customer();
                customer.setName(name != null ? name : "Facebook User");
                customer.setEmail(email);
                customer.setPhone("");
                customer.setAddress("");
                customer.setPassword(
                        passwordEncoder.encode(
                                UUID.randomUUID().toString()
                        )
                );
                customer.setEmailVerified(true);
                customer.setProvider("FACEBOOK");
                customer.setLoginCount(1);
                customerRepository.save(customer);

                System.out.println("✅ New Facebook customer: " + email);

                // ✅ Welcome email
                try {
                    emailService.sendWelcomeEmail(
                            email,
                            customer.getName(),
                            "FACEBOOK"
                    );
                    System.out.println(
                            "✅ Welcome email sent: " + email
                    );
                } catch (Exception emailEx) {
                    System.err.println(
                            "⚠️ Welcome email failed: " +
                                    emailEx.getMessage()
                    );
                }

            } else {
                // Existing - login count update
                int count = customer.getLoginCount() == null
                        ? 0 : customer.getLoginCount();
                customer.setLoginCount(count + 1);
                customerRepository.save(customer);
                System.out.println("✅ Facebook login: " + email);
            }

            String token = jwtUtil.generateToken(
                    email,
                    customer.getId(),
                    "CUSTOMER"
            );

            return CustomerAuthResponse.of(token, customer);

        } catch (Exception e) {
            System.err.println(
                    "❌ Facebook auth error: " + e.getMessage()
            );
            throw new RuntimeException(
                    "Facebook authentication failed: " + e.getMessage()
            );
        }
    }
}