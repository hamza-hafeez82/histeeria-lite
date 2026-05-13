<?php require_once __DIR__ . '/../src/env.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email | Histeeria</title>
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
        <h1 class="auth-title">Check your email</h1>
        <p style="text-align: center; color: #6b7280; margin-top: -1.5rem; margin-bottom: 2rem; font-size: 0.875rem;">
            We've sent a verification link to your email address. Please click the link to activate your account.
        </p>

        <div class="flex-center" style="margin-bottom: 2rem;">
            <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 50%;">
                <i data-lucide="mail" style="width: 48px; height: 48px; color: #7c3aed;"></i>
            </div>
        </div>

        <button type="button" class="btn-black" onclick="window.location.href='auth.php'">Back to log in</button>

        <p class="auth-switch">
            Didn't receive the email? 
            <button type="button" class="cursor-pointer font-semibold text-blue-600 hover:underline" style="background: none; border: none; font-family: inherit;">
                Click to resend
            </button>
        </p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabase.js"></script>
    <script>lucide.createIcons();</script>
</body>
</html>
