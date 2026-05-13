<?php require_once __DIR__ . '/../src/env.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password | Histeeria</title>
    <script>
        window.APP_CONFIG = {
            SUPABASE_URL: "<?php echo getenv('SUPABASE_URL'); ?>",
            SUPABASE_ANON_KEY: "<?php echo getenv('SUPABASE_ANON_KEY'); ?>"
        };
    </script>
    <link rel="stylesheet" href="assets/css/auth.css">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="auth-page">
    <div class="auth-container">
        <!-- Logo and Brand -->
        <div class="brand-section">
            <img src="assets/images/logo.png" alt="Histeeria" class="brand-logo" onerror="this.src='https://placehold.co/70x70?text=Logo'">
            <h2 class="brand-name">
                <span>Histeeria</span>
            </h2>
        </div>

        <!-- Title -->
        <h1 class="auth-title">Forgot password?</h1>
        <p style="text-align: center; color: #6b7280; margin-top: -1.5rem; margin-bottom: 2rem; font-size: 0.875rem;">
            No worries, we'll send you reset instructions.
        </p>

        <!-- Error/Success Message -->
        <div id="message-box" style="display: none; margin-bottom: 1.5rem; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem;">
        </div>

        <!-- Form -->
        <form id="forgot-password-form" class="space-y-5">
            <div class="form-group">
                <input type="email" id="forgot-email" name="email" placeholder=" " required>
                <label>Email address</label>
            </div>

            <button type="submit" id="forgot-submit" class="btn-black">Reset password</button>

            <p class="auth-switch">
                <a href="auth.php" class="cursor-pointer font-semibold text-blue-600 hover:underline" style="text-decoration: none;">
                    ← Back to log in
                </a>
            </p>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabase.js"></script>
    <script>
        document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const submitBtn = document.getElementById('forgot-submit');
            const messageBox = document.getElementById('message-box');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            messageBox.style.display = 'none';

            try {
                const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password.php',
                });

                if (error) throw error;

                messageBox.textContent = 'Reset link sent! Please check your email.';
                messageBox.style.background = '#f0fdf4';
                messageBox.style.border = '1px solid #bbf7d0';
                messageBox.style.color = '#15803d';
                messageBox.style.display = 'block';

            } catch (err) {
                messageBox.textContent = err.message;
                messageBox.style.background = '#fee2e2';
                messageBox.style.border = '1px solid #fecaca';
                messageBox.style.color = '#b91c1c';
                messageBox.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset password';
            }
        });
    </script>
</body>
</html>
