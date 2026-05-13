const SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Auth State Handler
 */
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (user) {
        console.log('Logged in as:', user.email);
        updateUIForAuthenticatedUser(user);
    } else {
        console.log('Not logged in');
        updateUIForGuest();
    }
}

function updateUIForAuthenticatedUser(user) {
    const authPages = ['auth.php', 'forgot-password.php', 'verify-email.php'];
    const isAuthPage = authPages.some(page => window.location.pathname.includes(page));

    if (isAuthPage) {
        window.location.href = 'index.php';
        return;
    }

    // Sync User Profile Data to Sidebar
    fetchProfileData(user.id);

    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.style.display = 'flex';
        logoutBtn.onclick = async () => {
            await _supabase.auth.signOut();
        };
    }
}

async function fetchProfileData(userId) {
    const { data: profile } = await _supabase.from('profiles').select('avatar_url, username, full_name').eq('id', userId).single();
    if (profile) {
        const sidebarAvatar = document.getElementById('sidebar-avatar-img');
        const mobileAvatar = document.getElementById('mobile-sidebar-avatar-img');
        const sidebarUsername = document.getElementById('display-username');
        const sidebarName = document.getElementById('display-full-name');
        
        const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;
        
        if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
        if (mobileAvatar) mobileAvatar.src = avatarUrl;
        if (sidebarUsername) sidebarUsername.textContent = profile.username;
        if (sidebarName) sidebarName.textContent = profile.full_name || 'Histeeria Member';
        
        // Also sync story avatar if on index
        const storyMe = document.getElementById('story-avatar-me');
        if (storyMe) storyMe.src = avatarUrl;
    }
}

function updateUIForGuest() {
    const authPages = ['auth.php', 'forgot-password.php', 'reset-password.php', 'verify-email.php', 'terms.php', 'privacy.php'];
    const isAuthPage = authPages.some(page => window.location.pathname.includes(page));

    if (!isAuthPage) {
        window.location.href = 'auth.php';
    }
}



// Listen for auth changes
_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') checkUser();
    if (event === 'SIGNED_OUT') window.location.reload();
});

// Initial check
checkUser();

// Export for other scripts
window.supabaseClient = _supabase;
