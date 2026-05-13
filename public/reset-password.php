<?php require_once __DIR__ . '/../src/env.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password | Histeeria</title>
    <script>
        window.APP_CONFIG = {
            SUPABASE_URL: "<?php echo getenv('SUPABASE_URL'); ?>",
            SUPABASE_ANON_KEY: "<?php echo getenv('SUPABASE_ANON_KEY'); ?>"
        };
    </script>
    <link rel="stylesheet" href="assets/css/auth.css">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="icon" type="image/png" href="assets/images/logo.png">
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
        <h1 class="auth-title">Set new password</h1>
        <p style="text-align: center; color: #6b7280; margin-top: -1.5rem; margin-bottom: 2rem; font-size: 0.875rem;">
            Your new password must be different from previously used passwords.
        </p>

        <!-- Error/Success Message -->
        <div id="message-box" style="display: none; margin-bottom: 1.5rem; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem;">
        </div>

        <!-- Form -->
        <form id="reset-password-form" class="space-y-5">
            <div class="form-group">
                <input type="password" id="new-password" name="password" placeholder=" " required minlength="8">
                <label>New password</label>
                <button type="button" class="password-toggle" onclick="toggleVisibility('new-password')">
                    <i data-lucide="eye"></i>
                </button>
            </div>
            <div class="form-group">
                <input type="password" id="confirm-password" name="confirm_password" placeholder=" " required>
                <label>Confirm new password</label>
                <button type="button" class="password-toggle" onclick="toggleVisibility('confirm-password')">
                    <i data-lucide="eye"></i>
                </button>
            </div>

            <button type="submit" id="reset-submit" class="btn-black">Reset password</button>

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
        function toggleVisibility(id) {
            const input = document.getElementById(id);
            const icon = event.currentTarget.querySelector('i');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            lucide.createIcons();
        }

        document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = document.getElementById('reset-submit');
            const messageBox = document.getElementById('message-box');

            if (password !== confirmPassword) {
                messageBox.textContent = "Passwords do not match.";
                messageBox.style.background = '#fee2e2';
                messageBox.style.border = '1px solid #fecaca';
                messageBox.style.color = '#b91c1c';
                messageBox.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
            messageBox.style.display = 'none';

            try {
                const { error } = await window.supabaseClient.auth.updateUser({ password });

                if (error) throw error;

                messageBox.textContent = 'Password updated successfully! Redirecting...';
                messageBox.style.background = '#f0fdf4';
                messageBox.style.border = '1px solid #bbf7d0';
                messageBox.style.color = '#15803d';
                messageBox.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 2000);

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

        // Initialize icons
        lucide.createIcons();
    </script>
</body>
</html>
