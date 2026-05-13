/**
 * Histeeria - Profile Management Logic
 * Handles fetching user profile, updating bio, social links, and file uploads
 */

document.addEventListener('DOMContentLoaded', async () => {
    await initProfile();
    initBioCounter();
});

const OFFICIAL_LOGOS = {
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
};

function initBioCounter() {
    const bioInput = document.getElementById('edit-bio');
    const counter = document.getElementById('bio-counter');
    if (bioInput && counter) {
        bioInput.addEventListener('input', () => {
            counter.textContent = `${bioInput.value.length} / 300`;
        });
    }
}

async function initProfile() {
    console.log('[Profile] initProfile started');

    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
    if (authError || !user) {
        console.warn('[Profile] No user, redirecting');
        window.location.href = 'auth.php';
        return;
    }

    const urlParams    = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('id') || user.id;
    const isOwnProfile = targetUserId === user.id;

    console.log('[Profile] targetUserId:', targetUserId, '| isOwnProfile:', isOwnProfile);

    try {
        const results = await Promise.all([
            window.supabaseClient.from('profiles').select('*').eq('id', targetUserId).single(),
            window.supabaseClient.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
            window.supabaseClient.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
            window.supabaseClient.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
            isOwnProfile
                ? Promise.resolve({ data: null, error: null })
                : window.supabaseClient.from('follows').select().eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle()
        ]);

        console.log('[Profile] Promise.all results:', results);

        const { data: profile, error: profileError } = results[0];
        const postCount      = results[1].count;
        const followerCount  = results[2].count;
        const followingCount = results[3].count;
        const followRow      = results[4].data;

        if (profileError) throw profileError;

        console.log('[Profile] profile:', profile?.username, '| followRow:', followRow);

        renderProfile(profile, isOwnProfile);

        document.getElementById('post-count').textContent      = postCount      ?? 0;
        document.getElementById('follower-count').textContent  = followerCount  ?? 0;
        document.getElementById('following-count').textContent = followingCount ?? 0;

        if (isOwnProfile) {
            setupEditForm(profile, user.id);
            document.getElementById('btn-edit-profile').style.display = 'block';
            console.log('[Profile] Own profile — showing edit button');
        } else {
            const isFollowing = !!followRow;
            console.log('[Profile] Other profile — isFollowing:', isFollowing);
            renderFollowButton(isFollowing);
            setupFollowLogic(user.id, targetUserId);
        }

    } catch (err) {
        console.error('[Profile] Fatal error in initProfile:', err);
    }
}


function formatUrlDisplay(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function renderFollowButton(isFollowing) {
    const followBtn   = document.getElementById('btn-follow-user');
    const unfollowBtn = document.getElementById('btn-unfollow-user');
    if (!followBtn || !unfollowBtn) return;

    followBtn.style.display   = isFollowing ? 'none'  : 'block';
    unfollowBtn.style.display = isFollowing ? 'block' : 'none';
}

function setupFollowLogic(myId, targetId) {
    const followBtn   = document.getElementById('btn-follow-user');
    const unfollowBtn = document.getElementById('btn-unfollow-user');
    const followerEl  = document.getElementById('follower-count');

    followBtn.onclick = async () => {
        followBtn.disabled = true;
        const { error } = await window.supabaseClient
            .from('follows')
            .insert({ follower_id: myId, following_id: targetId });

        if (!error) {
            followerEl.textContent = (parseInt(followerEl.textContent) || 0) + 1;
            renderFollowButton(true);
        } else {
            console.error('[Profile] Follow error:', error);
        }
        followBtn.disabled = false;
    };

    unfollowBtn.onclick = async () => {
        unfollowBtn.disabled = true;
        const { error } = await window.supabaseClient
            .from('follows')
            .delete()
            .eq('follower_id', myId)
            .eq('following_id', targetId);

        if (!error) {
            followerEl.textContent = Math.max(0, (parseInt(followerEl.textContent) || 0) - 1);
            renderFollowButton(false);
        } else {
            console.error('[Profile] Unfollow error:', error);
        }
        unfollowBtn.disabled = false;
    };
}


function renderProfile(profile, isOwnProfile = false) {
    const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

    document.getElementById('profile-username').textContent = profile.username;
    document.getElementById('profile-pic-main').src = avatarUrl;
    document.getElementById('profile-full-name-display').textContent = profile.full_name || profile.username;
    document.getElementById('profile-bio-display').textContent = profile.bio || 'No bio yet.';

    const websiteEl = document.getElementById('profile-website-display');
    if (profile.website) {
        websiteEl.textContent = formatUrlDisplay(profile.website);
        websiteEl.href = profile.website.startsWith('http') ? profile.website : `https://${profile.website}`;
        websiteEl.style.display = 'block';
    } else {
        websiteEl.style.display = 'none';
    }

    // Render Social Links
    const socialContainer = document.getElementById('social-links-container');
    socialContainer.innerHTML = '';

    const socials = [
        { key: 'ig_url', icon: 'instagram', label: 'Instagram' },
        { key: 'li_url', icon: 'linkedin', label: 'LinkedIn' },
        { key: 'x_url', icon: 'twitter', label: 'X' },
        { key: 'gh_url', icon: 'github', label: 'GitHub' },
        { key: 'fb_url', icon: 'facebook', label: 'Facebook' }
    ];

    socials.forEach(s => {
        if (profile[s.key] && profile[s.key].trim() !== '') {
            const link = document.createElement('a');
            link.href = profile[s.key];
            link.target = '_blank';
            link.title = s.label;
            link.className = `social-link-item brand-${s.icon}`;
            link.innerHTML = OFFICIAL_LOGOS[s.icon];
            socialContainer.appendChild(link);
        }
    });

    const sidebarAvatar = document.getElementById('sidebar-avatar-img');
    if (sidebarAvatar) sidebarAvatar.src = avatarUrl;

    // Load Posts Grid
    if (typeof loadProfilePosts === 'function') {
        loadProfilePosts(profile.id);
    }
}

function setupEditForm(profile, userId) {
    const form = document.getElementById('edit-profile-form');

    document.getElementById('edit-full-name').value = profile.full_name || '';
    document.getElementById('edit-bio').value = profile.bio || '';
    document.getElementById('edit-website').value = profile.website || '';
    document.getElementById('edit-ig').value = profile.ig_url || '';
    document.getElementById('edit-li').value = profile.li_url || '';
    document.getElementById('edit-x').value = profile.x_url || '';
    document.getElementById('edit-gh').value = profile.gh_url || '';
    document.getElementById('edit-fb').value = profile.fb_url || '';

    if (document.getElementById('bio-counter')) {
        document.getElementById('bio-counter').textContent = `${(profile.bio || '').length} / 300`;
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('save-profile-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            let avatarUrl = profile.avatar_url;
            const fileInput = document.getElementById('edit-avatar-file');

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}-${Math.random()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await window.supabaseClient.storage
                    .from('histeeria-assets')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = window.supabaseClient.storage
                    .from('histeeria-assets')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            const updates = {
                full_name: document.getElementById('edit-full-name').value,
                bio: document.getElementById('edit-bio').value,
                website: document.getElementById('edit-website').value,
                ig_url: document.getElementById('edit-ig').value,
                li_url: document.getElementById('edit-li').value,
                x_url: document.getElementById('edit-x').value,
                gh_url: document.getElementById('edit-gh').value,
                fb_url: document.getElementById('edit-fb').value,
                avatar_url: avatarUrl,
                updated_at: new Date()
            };

            const { error: updateError } = await window.supabaseClient
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (updateError) throw updateError;

            renderProfile({ ...profile, ...updates });
            if (window.closeModal) window.closeModal();

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    };
}
