/**
 * Histeeria - Global App Logic
 * Handles sidebar interactions, theme toggling, and mobile drawer
 */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initSidebar();
});

function initSidebar() {
    // DESKTOP: More Menu Toggle
    const btnMore = document.getElementById('btn-more');
    const moreMenu = document.getElementById('more-menu');

    if (btnMore && moreMenu) {
        btnMore.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            moreMenu.classList.toggle('show');
        });
    }

    // MOBILE: Drawer Logic
    const mobileBtnMore = document.getElementById('mobile-btn-more');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeDrawer = document.getElementById('close-drawer');

    if (mobileBtnMore && mobileDrawer) {
        mobileBtnMore.addEventListener('click', (e) => {
            e.preventDefault();
            mobileDrawer.classList.add('show');
            drawerOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });

        const hideDrawer = () => {
            mobileDrawer.classList.remove('show');
            drawerOverlay.classList.remove('show');
            document.body.style.overflow = '';
        };

        if (drawerOverlay) drawerOverlay.addEventListener('click', hideDrawer);
        if (closeDrawer) closeDrawer.addEventListener('click', hideDrawer);
    }

    // Close desktop menu on click outside
    document.addEventListener('click', (e) => {
        if (moreMenu && !moreMenu.contains(e.target) && !btnMore.contains(e.target)) {
            moreMenu.classList.remove('show');
        }
    });

    // Logout Functionality (Global)
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
                window.location.href = 'auth.php';
            }
        });
    });
}

// Universal Theme Toggle
window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    lucide.createIcons();
};
