<?php 
require_once __DIR__ . '/../src/env.php'; 
require_once __DIR__ . '/../src/components/sidebar.php';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile | Histeeria</title>
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
</head>
<body>
    <div class="app-container">
        <!-- Universal Sidebar -->
        <?php renderSidebar('profile'); ?>

        <main class="main-content">
            <div class="profile-container">
                <!-- Profile Header -->
                <header class="profile-header">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-big">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" id="profile-pic-main" alt="Profile">
                        </div>
                    </div>
                    
                    <div class="profile-info-section">
                        <div class="profile-actions">
                            <button class="profile-btn profile-btn--edit" id="btn-edit-profile" style="display: none;">Edit Profile</button>
                            <button class="profile-btn profile-btn--follow" id="btn-follow-user" style="display: none;">Follow</button>
                            <button class="profile-btn profile-btn--unfollow" id="btn-unfollow-user" style="display: none;">Following</button>
                            <button class="action-btn profile-settings-btn"><i data-lucide="settings"></i></button>
                        </div>
                        <div class="profile-username-row">
                            <h2 class="profile-username" id="profile-username">username</h2>
                        </div>

                        <ul class="profile-stats-row">
                            <li><b id="post-count">0</b> posts</li>
                            <li><b id="follower-count">0</b> followers</li>
                            <li><b id="following-count">0</b> following</li>
                        </ul>

                        <div class="profile-bio-section">
                            <span class="profile-full-name" id="profile-full-name-display">Display Name</span>
                            <p class="profile-bio" id="profile-bio-display">This is your bio. Click "Edit Profile" to update it!</p>
                            <a href="#" class="profile-website" id="profile-website-display" target="_blank">www.histeeria.site</a>
                            
                            <div class="profile-social-links" id="social-links-container" style="display: flex; gap: 14px; margin-top: 12px; color: var(--text-main);">
                                <!-- Icons injected here -->
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Profile Tabs -->
                <div class="profile-tabs">
                    <div class="profile-tab active">
                        <i data-lucide="grid"></i>
                        POSTS
                    </div>
                    <div class="profile-tab">
                        <i data-lucide="play-circle"></i>
                        REELS
                    </div>
                    <div class="profile-tab">
                        <i data-lucide="bookmark"></i>
                        SAVED
                    </div>
                    <div class="profile-tab">
                        <i data-lucide="user-square"></i>
                        TAGGED
                    </div>
                </div>

                <!-- Posts Grid -->
                <div class="profile-posts-grid" id="profile-posts-grid">
                    <!-- Posts will be loaded here by JS -->
                </div>
            </div>
        </main>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal" id="edit-profile-modal">
        <div class="modal-content" style="max-width: 600px;">
            <h3 class="modal-header">Edit Profile</h3>
            <form id="edit-profile-form">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="edit-section-left">
                        <div class="edit-form-group">
                            <label>Full Name</label>
                            <input type="text" id="edit-full-name">
                        </div>
                        <div class="edit-form-group">
                            <label>Bio (Max 300 chars)</label>
                            <textarea id="edit-bio" rows="4" maxlength="300"></textarea>
                            <div id="bio-counter" style="font-size: 11px; text-align: right; color: var(--text-muted);">0 / 300</div>
                        </div>
                        <div class="edit-form-group">
                            <label>Website</label>
                            <input type="url" id="edit-website" placeholder="https://example.com">
                        </div>
                        <div class="edit-form-group">
                            <label>Profile Picture</label>
                            <input type="file" id="edit-avatar-file" accept="image/*" class="file-input-custom">
                        </div>
                    </div>
                    <div class="edit-section-right">
                        <div class="edit-form-group">
                            <label><i data-lucide="instagram" style="width: 14px; vertical-align: middle;"></i> Instagram URL</label>
                            <input type="url" id="edit-ig" placeholder="https://instagram.com/user">
                        </div>
                        <div class="edit-form-group">
                            <label><i data-lucide="linkedin" style="width: 14px; vertical-align: middle;"></i> LinkedIn URL</label>
                            <input type="url" id="edit-li" placeholder="https://linkedin.com/in/user">
                        </div>
                        <div class="edit-form-group">
                            <label><i data-lucide="twitter" style="width: 14px; vertical-align: middle;"></i> X (Twitter) URL</label>
                            <input type="url" id="edit-x" placeholder="https://x.com/user">
                        </div>
                        <div class="edit-form-group">
                            <label><i data-lucide="github" style="width: 14px; vertical-align: middle;"></i> GitHub URL</label>
                            <input type="url" id="edit-gh" placeholder="https://github.com/user">
                        </div>
                        <div class="edit-form-group">
                            <label><i data-lucide="facebook" style="width: 14px; vertical-align: middle;"></i> Facebook URL</label>
                            <input type="url" id="edit-fb" placeholder="https://facebook.com/user">
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="button" class="profile-edit-btn" style="flex: 1;" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="profile-edit-btn" style="flex: 1; background: var(--accent); color: white;" id="save-profile-btn">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabase.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/posts.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/profile.js?v=<?php echo time(); ?>"></script>
    <script>
        // Modal Logic
        const modal = document.getElementById('edit-profile-modal');
        document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
            modal.classList.add('show');
        });
        
        function closeModal() {
            modal.classList.remove('show');
        }
    </script>
</body>
</html>
