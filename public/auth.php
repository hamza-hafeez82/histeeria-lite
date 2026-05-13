<?php require_once __DIR__ . '/../src/env.php'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Histeeria | Authentication</title>
    <script>
        window.APP_CONFIG = {
            SUPABASE_URL: "<?php echo getenv('SUPABASE_URL'); ?>",
            SUPABASE_ANON_KEY: "<?php echo getenv('SUPABASE_ANON_KEY'); ?>"
        };
    </script>
    <link rel="stylesheet" href="assets/css/auth.css?v=<?php echo time(); ?>">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="icon" type="image/png" href="assets/images/logo.png">
</head>

<body class="auth-page">
    <div class="auth-container">
        <!-- Logo and Brand -->
        <div class="brand-section">
            <img src="assets/images/logo.png" alt="Histeeria" class="brand-logo"
                onerror="this.src='https://placehold.co/70x70?text=Logo'">
            <h2 class="brand-name">
                <span>Histeeria</span>
            </h2>
        </div>

        <!-- Title -->
        <h1 class="auth-title" id="auth-title">Welcome back</h1>

        <!-- Error Message -->
        <div id="error-message"></div>

        <!-- OTP Verification Step -->
        <div id="otp-verification" style="display: none;">
            <p style="text-align: center; color: #6b7280; margin-bottom: 2rem; font-size: 0.875rem;">
                We've sent a 6-digit code to your email. It expires in 10 minutes.
            </p>
            <form id="otp-form" class="space-y-5">
                <div class="form-group">
                    <input type="text" id="verification-code" name="code" placeholder=" " required maxlength="6">
                    <label>6-digit code</label>
                </div>
                <button type="submit" id="otp-submit" class="btn-black">Verify and Create Account</button>
                <p class="auth-switch">
                    Didn't receive it? <button type="button" onclick="resendOtp()">Resend</button>
                </p>
            </form>
        </div>

        <!-- Main Form -->
        <form id="auth-form" class="space-y-5">
            <!-- Sign In Fields -->
            <div id="signin-fields">
                <div class="form-group">
                    <input type="text" id="email_or_username" name="email_or_username" placeholder=" " required>
                    <label>Email or Username</label>
                </div>
            </div>

            <!-- Sign Up Fields (Hidden initially) -->
            <div id="signup-fields" style="display: none;">
                <div class="form-group">
                    <input type="email" id="signup-email" name="email" placeholder=" " required>
                    <label>Email address</label>
                </div>
                <div class="form-group">
                    <input type="text" id="signup-username" name="username" placeholder=" " required>
                    <label>Username</label>
                </div>
                <div class="form-group">
                    <input type="text" id="signup-displayname" name="display_name" placeholder=" " required>
                    <label>Display name</label>
                </div>
                <div class="form-group age-group">
                    <input type="number" id="signup-age" name="age" placeholder=" " required value="18" min="13"
                        max="130">
                    <label>Age</label>
                    <div class="age-help">
                        <i data-lucide="help-circle"></i>
                        <span class="tooltip">We ask for your age to ensure you meet our minimum age requirement of 13
                            and to provide a tailored experience. Age must be between 13 and 130.</span>
                    </div>
                </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
                <input type="password" id="password" name="password" placeholder=" " required>
                <label>Password</label>
                <button type="button" class="password-toggle" onclick="togglePasswordVisibility()">
                    <i data-lucide="eye" id="password-toggle-icon"></i>
                </button>
            </div>

            <!-- Forgot Password -->
            <div id="forgot-password-link">
                <a href="forgot-password.php" class="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" id="auth-submit" class="btn-black">Continue</button>

            <p class="auth-switch">
                <span id="auth-switch-text">Don't have an account?</span>
                <button type="button" id="auth-switch-btn" onclick="toggleAuthMode()">Sign up</button>
            </p>
        </form>

        <!-- OR Separator -->
        <div class="divider">
            <span>OR</span>
        </div>

        <!-- Social Auth -->
        <div class="social-auth">
            <button type="button" class="social-btn" onclick="socialAuth('google')">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                Continue with Google
            </button>
            <button type="button" class="social-btn" onclick="socialAuth('github')">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path fill-rule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clip-rule="evenodd" />
                </svg>
                Continue with GitHub
            </button>
            <button type="button" class="social-btn" onclick="socialAuth('linkedin')">
                <svg class="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24" width="20" height="20">
                    <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
            </button>
        </div>

        <!-- Footer Links -->
        <div class="auth-footer-links">
            <a href="terms.php">Terms of Use</a>
            <span style="color: #d1d5db;">|</span>
            <a href="privacy.php">Privacy Policy</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabase.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/auth-v2.js?v=<?php echo time(); ?>"></script>
    <script>lucide.createIcons();</script>
</body>

</html>