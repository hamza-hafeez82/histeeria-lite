<?php 
require_once __DIR__ . '/../src/env.php'; 
require_once __DIR__ . '/../src/components/sidebar.php';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Histeeria</title>
    <script>
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        window.APP_CONFIG = {
            SUPABASE_URL: "<?php echo getenv('SUPABASE_URL'); ?>",
            SUPABASE_ANON_KEY: "<?php echo getenv('SUPABASE_ANON_KEY'); ?>"
        };
    </script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="icon" type="image/png" href="assets/images/logo.png">
</head>
<body>
    <div class="app-container">
        <!-- Universal Sidebar -->
        <?php renderSidebar('home'); ?>

        <!-- Main Feed -->
        <main class="main-content">
            <div class="feed-container">
                <div class="feed-content">
                    <!-- Stories -->
                    <section class="stories-tray">
                        <div class="story-item">
                            <div class="story-avatar-wrapper">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" alt="Your Story" id="story-avatar-me">
                            </div>
                            <span>Your Story</span>
                        </div>
                    </section>

                    <!-- Posts -->
                    <section id="posts-feed">
                        <div style="padding: 100px 0; text-align: center; color: var(--text-muted);">
                            <p>Loading your feed...</p>
                        </div>
                    </section>
                </div>
            </div>
        </main>

        <!-- Right Sidebar -->
        <aside class="right-sidebar">
            <div class="user-preview">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="avatar-sm" style="width: 44px; height: 44px;">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" id="user-avatar" alt="Me">
                    </div>
                    <div class="user-info">
                        <span class="username-sm" id="display-username">username</span>
                        <span class="name-sm" id="display-full-name">Display Name</span>
                    </div>
                </div>
                <button class="action-btn">Switch</button>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <span style="font-size: 14px; font-weight: 600; color: var(--text-muted);">Suggested for you</span>
                <button class="action-btn" style="color: var(--text-main);">See All</button>
            </div>

            <div id="suggestions-container">
                <!-- Suggestions will be injected here -->
            </div>

            <footer class="side-footer">
                <p>About &bull; Help &bull; Press &bull; API &bull; Jobs &bull; Privacy &bull; Terms &bull; Locations &bull; Language &bull; Meta Verified</p>
                <p style="margin-top: 16px; letter-spacing: 0.5px;">&copy; 2026 HISTEERIA FROM GOOGLE DEEPMIND</p>
            </footer>
        </aside>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabase.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/posts.js?v=<?php echo time(); ?>"></script>
</body>
</html>