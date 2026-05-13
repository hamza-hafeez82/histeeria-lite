<?php
function renderSidebar($activePage = 'home')
{
    ?>
    <!-- Desktop Sidebar -->
    <aside class="sidebar desktop-only">
        <div class="sidebar-header">
            <a href="index.php" class="sidebar-logo-link">
                <img src="assets/images/logo.png" alt="Histeeria" class="sidebar-logo-img">
                <span class="sidebar-logo-text">Histeeria</span>
            </a>
        </div>

        <nav class="sidebar-nav">
            <a href="index.php" class="nav-item <?php echo $activePage === 'home' ? 'active' : ''; ?>">
                <i data-lucide="home"></i>
                <span>Home</span>
            </a>
            <a href="search.php" class="nav-item <?php echo $activePage === 'search' ? 'active' : ''; ?>">
                <i data-lucide="search"></i>
                <span>Search</span>
            </a>
            <a href="#" class="nav-item <?php echo $activePage === 'explore' ? 'active' : ''; ?>">
                <i data-lucide="compass"></i>
                <span>Explore</span>
            </a>
            <a href="#" class="nav-item <?php echo $activePage === 'messages' ? 'active' : ''; ?>">
                <i data-lucide="send"></i>
                <span>Messages</span>
            </a>
            <a href="#" class="nav-item <?php echo $activePage === 'notifications' ? 'active' : ''; ?>">
                <i data-lucide="heart"></i>
                <span>Notifications</span>
            </a>
            <a href="#" class="nav-item" id="btn-create-post">
                <i data-lucide="plus-square"></i>
                <span>Create</span>
            </a>
            <a href="profile.php" class="nav-item <?php echo $activePage === 'profile' ? 'active' : ''; ?>">
                <div class="avatar-sm sidebar-profile-icon"
                    style="width: 24px; height: 24px; border: 1px solid var(--border-color);">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Profile" id="sidebar-avatar-img">
                </div>
                <span>Profile</span>
            </a>
        </nav>

        <div class="sidebar-footer">
            <div class="more-menu" id="more-menu">
                <div class="more-item" onclick="loadFilteredFeed('saved')">
                    <i data-lucide="bookmark"></i>
                    <span>Saved</span>
                </div>
                <div class="more-item" onclick="loadFilteredFeed('liked')">
                    <i data-lucide="heart"></i>
                    <span>Liked</span>
                </div>
                <div class="more-item" onclick="toggleTheme()">
                    <i data-lucide="moon" id="theme-icon"></i>
                    <span>Switch appearance</span>
                </div>
                <div class="more-item">
                    <i data-lucide="settings"></i>
                    <span>Settings</span>
                </div>
                <div class="more-item logout-btn" id="nav-logout">
                    <i data-lucide="log-out"></i>
                    <span>Log out</span>
                </div>
            </div>
            <a href="#" class="nav-item" id="btn-more">
                <i data-lucide="menu"></i>
                <span>More</span>
            </a>
        </div>
    </aside>

    <!-- Mobile Top Bar -->
    <header class="mobile-top-bar mobile-only">
        <a href="index.php" class="mobile-logo-link">
            <img src="assets/images/logo.png" alt="Histeeria" class="mobile-logo-img">
            <span style="font-size: 20px; font-weight: 800; margin-left: 8px;">Histeeria</span>
        </a>
        <div class="mobile-top-actions">
            <a href="#" id="mobile-btn-more"><i data-lucide="menu"></i></a>
            <a href="#"><i data-lucide="heart"></i></a>
            <a href="#"><i data-lucide="send"></i></a>
        </div>
    </header>

    <!-- Mobile Drawer Sidebar (Sliding from left) -->
    <div class="mobile-drawer-overlay" id="drawer-overlay"></div>
    <aside class="mobile-drawer" id="mobile-drawer">
        <div class="drawer-header">
            <h3>Histeeria</h3>
            <i data-lucide="x" id="close-drawer" style="cursor: pointer;"></i>
        </div>
        <div class="drawer-content">
            <div class="drawer-item" onclick="loadFilteredFeed('saved')">
                <i data-lucide="bookmark"></i>
                <span>Saved</span>
            </div>
            <div class="drawer-item" onclick="loadFilteredFeed('liked')">
                <i data-lucide="heart"></i>
                <span>Liked</span>
            </div>
            <div class="drawer-item" onclick="toggleTheme()">
                <i data-lucide="moon"></i>
                <span>Switch appearance</span>
            </div>
            <div class="drawer-item">
                <i data-lucide="settings"></i>
                <span>Settings</span>
            </div>
        </div>
        <div class="drawer-footer">
            <div class="drawer-item logout-btn" id="mobile-logout">
                <i data-lucide="log-out"></i>
                <span>Log out</span>
            </div>
        </div>
    </aside>

    <!-- Mobile Bottom Nav -->
    <nav class="mobile-bottom-nav mobile-only">
        <a href="index.php" class="mobile-nav-item <?php echo $activePage === 'home' ? 'active' : ''; ?>">
            <i data-lucide="home"></i>
        </a>
        <a href="#" class="mobile-nav-item <?php echo $activePage === 'explore' ? 'active' : ''; ?>">
            <i data-lucide="compass"></i>
        </a>
        <a href="#" class="mobile-nav-item" id="mobile-btn-create-post">
            <i data-lucide="plus-square"></i>
        </a>
        <a href="#" class="mobile-nav-item <?php echo $activePage === 'reels' ? 'active' : ''; ?>">
            <i data-lucide="clapperboard"></i>
        </a>
        <a href="profile.php" class="mobile-nav-item <?php echo $activePage === 'profile' ? 'active' : ''; ?>">
            <div class="avatar-sm" style="width: 24px; height: 24px; border: 1px solid var(--border-color);">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Profile"
                    id="mobile-sidebar-avatar-img">
            </div>
        </a>
    </nav>
    <?php
    // ---- Global Modals (rendered inside body via renderSidebar) ----
    ?>
<div class="create-post-modal" id="create-post-modal">
    <div class="create-post-container">
        <div class="create-post-header">
            <button class="action-btn" id="close-create-post"
                style="color: var(--text-main); font-size: 14px;">Cancel</button>
            <h3>Create New Post</h3>
            <button class="action-btn" id="share-post-btn"
                style="color: var(--accent); font-size: 14px; font-weight: 700;">Share</button>
        </div>
        <div class="create-post-body">
            <div class="media-preview-container" id="media-drop-zone"
                onclick="document.getElementById('post-media-input').click()">
                <div id="media-placeholder" style="text-align: center; color: var(--text-muted);">
                    <i data-lucide="image"
                        style="width: 48px; height: 48px; margin-bottom: 12px; margin-left: auto; margin-right: auto; display: block;"></i>
                    <p>Click to upload Photo or Video</p>
                </div>
                <input type="file" id="post-media-input" accept="image/*,video/*" style="display: none;">
                <div id="media-preview-wrap" style="display: none; width: 100%; height: 100%;"></div>
            </div>
            <input type="text" id="post-title" class="create-post-input" placeholder="Add a title (optional)...">
            <textarea id="post-caption" class="create-post-input" rows="4" placeholder="Write a caption..."></textarea>
        </div>
    </div>
</div>
<!-- Success Toast -->
<div class="success-toast" id="success-toast">
    <div class="success-icon-wrap">
        <i data-lucide="check" style="width: 32px; height: 32px;"></i>
    </div>
    <h3 style="margin: 0; font-size: 18px;">Shared Successfully</h3>
</div>

<!-- Post Detail Modal (Global) -->
<div class="post-detail-modal" id="post-detail-modal">
    <div class="post-detail-overlay" onclick="closePostModal()"></div>
    <div class="post-detail-container">
        <button class="close-detail-btn" onclick="closePostModal()"><i data-lucide="x"></i></button>

        <div class="post-detail-media-side" id="detail-media-container">
            <!-- Media will be injected here -->
        </div>

        <div class="post-detail-info-side">
            <header class="detail-header">
                <a href="#" class="post-user" id="detail-user-link" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 10px;">
                    <div class="avatar-sm" id="detail-user-avatar-wrap" style="width: 32px; height: 32px;">
                        <img src="" alt="" id="detail-user-avatar" style="width: 100%; height: 100%; border-radius: 50%;">
                    </div>
                    <span class="username-sm" id="detail-username" style="font-weight: 700;"></span>
                </a>
                <button class="action-btn"><i data-lucide="more-horizontal"></i></button>
            </header>

            <div class="detail-comments-list" id="detail-comments-list">
                <!-- Caption and Comments will be injected here -->
            </div>

            <div class="detail-actions-footer">
                <div class="post-actions" style="padding: 12px 16px 8px;">
                    <div class="post-actions-left" style="display: flex; gap: 4px;">
                        <button class="post-action-btn" id="detail-like-btn"><i data-lucide="heart"></i></button>
                        <button class="post-action-btn"><i data-lucide="message-circle"></i></button>
                        <button class="post-action-btn"><i data-lucide="send"></i></button>
                    </div>
                    <button class="post-action-btn" id="detail-save-btn"><i data-lucide="bookmark"></i></button>
                </div>
                <div style="padding: 0 16px 12px;">
                    <div id="detail-like-count" style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">0 likes
                    </div>
                    <time id="detail-time"
                        style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;"></time>
                </div>

                <div class="comment-input-area">
                    <i data-lucide="smile" style="cursor: pointer;"></i>
                    <input type="text" id="new-comment-input" placeholder="Add a comment...">
                    <button id="submit-comment-btn" disabled>Post</button>
                </div>
            </div>
        </div>
    </div>
</div>
<?php
}
?>