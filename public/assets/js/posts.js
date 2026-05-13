/**
 * Histeeria - Post Management Logic
 * Handles creating, fetching, and displaying posts
 */

document.addEventListener('DOMContentLoaded', () => {
    initPostCreation();
    if (window.location.pathname.includes('index.php') || window.location.pathname === '/') {
        loadHomeFeed();
    }
});

function initPostCreation() {
    const createBtn = document.getElementById('btn-create-post');
    const mobileCreateBtn = document.getElementById('mobile-btn-create-post');
    const modal = document.getElementById('create-post-modal');
    
    if (modal) {
        const openModal = (e) => {
            e.preventDefault();
            modal.classList.add('show');
        };
        if (createBtn) createBtn.addEventListener('click', openModal);
        if (mobileCreateBtn) mobileCreateBtn.addEventListener('click', openModal);
    }

    const closeBtn = document.getElementById('close-create-post');
    const mediaInput = document.getElementById('post-media-input');
    const previewWrap = document.getElementById('media-preview-wrap');
    const placeholder = document.getElementById('media-placeholder');
    const shareBtn = document.getElementById('share-post-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            resetCreateModal();
        });
    }

    if (mediaInput) {
        mediaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    placeholder.style.display = 'none';
                    previewWrap.style.display = 'block';
                    
                    if (file.type.startsWith('image/')) {
                        previewWrap.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else if (file.type.startsWith('video/')) {
                        previewWrap.innerHTML = `<video src="${e.target.result}" autoplay muted loop style="width: 100%; height: 100%; object-fit: cover;"></video>`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const file = mediaInput.files[0];
            const title = document.getElementById('post-title').value;
            const caption = document.getElementById('post-caption').value;

            if (!file) {
                alert('Please select a photo or video');
                return;
            }

            shareBtn.disabled = true;
            shareBtn.textContent = 'Sharing...';

            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // 1. Upload to Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                    .from('histeeria-assets')
                    .upload(`posts/${fileName}`, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = window.supabaseClient.storage
                    .from('histeeria-assets')
                    .getPublicUrl(`posts/${fileName}`);

                // 2. Insert into DB
                const { error: dbError } = await window.supabaseClient
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        media_url: publicUrl,
                        content_type: file.type.startsWith('image/') ? 'image' : 'video',
                        title: title,
                        description: caption
                    });

                if (dbError) throw dbError;

                // 3. Success
                modal.classList.remove('show');
                const toast = document.getElementById('success-toast');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                        location.reload();
                    }, 2000);
                } else {
                    alert('Post shared successfully!');
                    location.reload();
                }
                resetCreateModal();

            } catch (err) {
                console.error('Error sharing post:', err);
                alert('Failed to share post: ' + err.message);
            } finally {
                shareBtn.disabled = false;
                shareBtn.textContent = 'Share';
            }
        });
    }
}

function resetCreateModal() {
    document.getElementById('post-media-input').value = '';
    document.getElementById('media-preview-wrap').innerHTML = '';
    document.getElementById('media-preview-wrap').style.display = 'none';
    document.getElementById('media-placeholder').style.display = 'block';
    document.getElementById('post-title').value = '';
    document.getElementById('post-caption').value = '';
}

async function loadHomeFeed() {
    const feedContainer = document.getElementById('posts-feed');
    if (!feedContainer) return;

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        // Fetch posts with profiles, likes, saves, and comments
        const { data: posts, error } = await window.supabaseClient
            .from('posts')
            .select(`
                *,
                profiles (id, username, avatar_url, full_name),
                likes (user_id),
                saves (user_id),
                comments (id)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (posts.length === 0) {
            feedContainer.innerHTML = `
                <div style="padding: 100px 0; text-align: center; color: var(--text-muted);">
                    <i data-lucide="camera" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>No posts yet. Be the first to share something!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        feedContainer.innerHTML = posts.map(post => {
            const isLiked = user && post.likes.some(l => l.user_id === user.id);
            const isSaved = user && post.saves.some(s => s.user_id === user.id);
            const likeCount = post.likes.length;
            const commentCount = post.comments.length;
            
            return renderPostCard(post, isLiked, isSaved, likeCount, commentCount);
        }).join('');
        
        lucide.createIcons();
        initVideoObserver();

    } catch (err) {
        console.error('Error loading feed:', err);
    }
}

function renderPostCard(post, isLiked = false, isSaved = false, likeCount = 0, commentCount = 0) {
    const avatar = post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`;
    const videoId = `vid-${post.id}`;

    const media = post.content_type === 'video'
        ? `
            <div class="video-player-wrap" id="wrap-${post.id}">
                <video id="${videoId}" src="${post.media_url}" muted loop playsinline class="post-media-content"
                    onclick="toggleVideoPlay('${post.id}')"></video>

                <!-- Play / Pause big icon (shows on pause) -->
                <div class="video-play-overlay" id="overlay-${post.id}" onclick="toggleVideoPlay('${post.id}')">
                    <svg viewBox="0 0 24 24" fill="white" width="52" height="52">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>

                <!-- Mute / Unmute button (always visible) -->
                <button class="video-mute-btn" id="mute-${post.id}" onclick="toggleVideoMute('${post.id}')" title="Toggle mute">
                    <svg id="mute-icon-${post.id}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                </button>
            </div>`
        : `<img src="${post.media_url}" alt="Post" class="post-media-content">`;

    return `
        <article class="post-card" data-post-id="${post.id}">
            <header class="post-header" style="padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                <a href="profile.php?id=${post.profiles.id}" class="post-user" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit;">
                    <div class="avatar-sm" style="width: 32px; height: 32px;">
                        <img src="${avatar}" alt="${post.profiles.username}" style="width: 100%; height: 100%; border-radius: 50%;">
                    </div>
                    <div class="post-user-info" style="display: flex; flex-direction: column;">
                        <span class="username-sm" style="font-weight: 700;">${post.profiles.username}</span>
                        ${post.title ? `<span style="font-size: 12px; color: var(--text-muted);">${post.title}</span>` : ''}
                    </div>
                </a>
                <button class="post-action-btn"><i data-lucide="more-horizontal"></i></button>
            </header>
            
            <div class="post-media" ondblclick="toggleLike('${post.id}')">
                ${media}
            </div>
            
            <div class="post-actions" style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <div class="post-actions-left" style="display: flex; gap: 4px; align-items: flex-start;">
                    <button class="post-action-btn" onclick="toggleLike('${post.id}', this)" style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <i data-lucide="heart" style="${isLiked ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>
                        <span style="font-size: 10px; font-weight: 600;">${likeCount > 0 ? likeCount : ''}</span>
                    </button>
                    <button class="post-action-btn" onclick="focusComment('${post.id}')" style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <i data-lucide="message-circle"></i>
                        <span style="font-size: 10px; font-weight: 600;">${commentCount > 0 ? commentCount : ''}</span>
                    </button>
                    <button class="post-action-btn" style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <i data-lucide="send"></i>
                    </button>
                </div>
                <button class="post-action-btn" onclick="toggleSave('${post.id}', this)">
                    <i data-lucide="bookmark" style="${isSaved ? 'fill: var(--text-main);' : ''}"></i>
                </button>
            </div>
            
            <div class="post-content" style="padding: 0 12px 16px;">
                <div style="font-weight: 700; margin-bottom: 4px; font-size: 14px;">${likeCount} likes</div>
                <p class="post-description" style="font-size: 14px; line-height: 1.4;">
                    <span style="font-weight: 700; margin-right: 6px;">${post.profiles.username}</span>
                    ${post.description || ''}
                </p>
                ${commentCount > 0 ? `
                    <div onclick="openPostModal('${post.id}')" style="color: var(--text-muted); font-size: 14px; margin-top: 8px; cursor: pointer;">
                        View all ${commentCount} comments
                    </div>
                ` : ''}
                <time class="post-time" style="font-size: 12px; color: var(--text-muted); margin-top: 8px; display: block;">${new Date(post.created_at).toLocaleDateString()}</time>
            </div>
        </article>
    `;
}

function toggleVideoPlay(postId) {
    const video = document.getElementById(`vid-${postId}`);
    const overlay = document.getElementById(`overlay-${postId}`);
    if (!video) return;

    if (video.paused) {
        video.play();
        overlay.style.opacity = '0';
    } else {
        video.pause();
        overlay.style.opacity = '1';
    }
}

function toggleVideoMute(postId) {
    const video = document.getElementById(`vid-${postId}`);
    const icon  = document.getElementById(`mute-icon-${postId}`);
    if (!video) return;

    video.muted = !video.muted;

    // Swap SVG path for muted state
    if (video.muted) {
        icon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>`;
    } else {
        icon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`;
    }
}

// Auto-play videos when scrolled into view (like Instagram)
function initVideoObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
                const overlay = document.getElementById(`overlay-${video.id.replace('vid-', '')}`);
                if (overlay) overlay.style.opacity = '0';
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('video.post-media-content').forEach(v => observer.observe(v));
}

async function toggleLike(postId, btn) {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;

        // Check if already liked
        const { data: existingLike } = await window.supabaseClient
            .from('likes')
            .select()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            await window.supabaseClient.from('likes').delete().eq('id', existingLike.id);
        } else {
            await window.supabaseClient.from('likes').insert({ post_id: postId, user_id: user.id });
        }
        
        loadHomeFeed(); // Reload to update UI
    } catch (err) {
        console.error('Error toggling like:', err);
    }
}

async function toggleSave(postId, btn) {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;

        const { data: existingSave } = await window.supabaseClient
            .from('saves')
            .select()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingSave) {
            await window.supabaseClient.from('saves').delete().eq('id', existingSave.id);
        } else {
            await window.supabaseClient.from('saves').insert({ post_id: postId, user_id: user.id });
        }
        
        loadHomeFeed();
    } catch (err) {
        console.error('Error toggling save:', err);
    }
}

async function loadFilteredFeed(filterType) {
    const feedContainer = document.getElementById('posts-feed');
    if (!feedContainer) return;

    // Show loading or clear feed
    feedContainer.innerHTML = `<div style="padding: 100px 0; text-align: center;"><p>Loading your ${filterType} posts...</p></div>`;

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;

        let query = window.supabaseClient
            .from('posts')
            .select(`
                *,
                profiles (username, avatar_url, full_name),
                likes!inner (user_id),
                saves (user_id)
            `);

        if (filterType === 'saved') {
            query = window.supabaseClient
                .from('posts')
                .select(`
                    *,
                    profiles (username, avatar_url, full_name),
                    likes (user_id),
                    saves!inner (user_id)
                `)
                .eq('saves.user_id', user.id);
        } else if (filterType === 'liked') {
            query = query.eq('likes.user_id', user.id);
        }

        const { data: posts, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Add a header to show we are in a filtered view
        const headerHtml = `
            <div style="padding: 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                <button class="action-btn" onclick="location.reload()" style="display: flex; align-items: center; gap: 5px;">
                    <i data-lucide="arrow-left"></i> Back
                </button>
                <h2 style="font-size: 18px; text-transform: capitalize;">Your ${filterType} Posts</h2>
            </div>
        `;

        if (posts.length === 0) {
            feedContainer.innerHTML = headerHtml + `
                <div style="padding: 100px 0; text-align: center; color: var(--text-muted);">
                    <i data-lucide="layers" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>You haven't ${filterType === 'liked' ? 'liked' : 'saved'} any posts yet.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        feedContainer.innerHTML = headerHtml + posts.map(post => {
            const isLiked = user && post.likes.some(l => l.user_id === user.id);
            const isSaved = user && post.saves.some(s => s.user_id === user.id);
            const likeCount = post.likes.length;
            return renderPostCard(post, isLiked, isSaved, likeCount);
        }).join('');
        
        lucide.createIcons();
        window.scrollTo(0,0);

    } catch (err) {
        console.error(`Error loading ${filterType} feed:`, err);
        feedContainer.innerHTML = `<div style="padding: 100px 0; text-align: center; color: #ef4444;"><p>Failed to load ${filterType} posts.</p></div>`;
    }
}

async function loadProfilePosts(userId) {
    const gridContainer = document.getElementById('profile-posts-grid');
    if (!gridContainer) return;

    try {
        const { data: posts, error } = await window.supabaseClient
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (posts.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-posts" style="padding: 100px 0; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
                    <i data-lucide="camera" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>No posts yet</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        gridContainer.innerHTML = posts.map(post => `
            <div class="grid-post-item" onclick="openPostModal('${post.id}')" style="aspect-ratio: 1/1; position: relative; cursor: pointer; overflow: hidden; border-radius: 4px;">
                ${post.content_type === 'video' 
                    ? `<video src="${post.media_url}" muted loop style="width: 100%; height: 100%; object-fit: cover;"></video>
                       <div style="position: absolute; top: 10px; right: 10px; color: white; filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));">
                           <i data-lucide="play" style="width: 20px; height: 20px;"></i>
                       </div>`
                    : `<img src="${post.media_url}" alt="Post" style="width: 100%; height: 100%; object-fit: cover;">`
                }
                <div class="grid-item-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; gap: 20px; color: white; opacity: 0; transition: opacity 0.2s;">
                   <!-- We can add like/comment counts here later -->
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();

    } catch (err) {
        console.error('Error loading profile posts:', err);
    }
}

async function openPostModal(postId) {
    const modal = document.getElementById('post-detail-modal');
    if (!modal) return;

    try {
        const { data: post, error } = await window.supabaseClient
            .from('posts')
            .select(`
                *,
                profiles (username, avatar_url, full_name),
                likes (user_id),
                saves (user_id),
                comments (
                    id, content, created_at, user_id,
                    profiles (username, avatar_url)
                )
            `)
            .eq('id', postId)
            .single();

        if (error) throw error;

        const { data: { user } } = await window.supabaseClient.auth.getUser();

        // 1. Populate Media
        const mediaContainer = document.getElementById('detail-media-container');
        mediaContainer.innerHTML = post.content_type === 'video'
            ? `<video src="${post.media_url}" autoplay controls loop></video>`
            : `<img src="${post.media_url}" alt="Post">`;

        // 2. Populate Header
        document.getElementById('detail-user-link').href = `profile.php?id=${post.user_id}`;
        document.getElementById('detail-username').textContent = post.profiles.username;
        document.getElementById('detail-user-avatar').src = post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`;

        // 3. Populate Actions
        const isLiked = user && post.likes.some(l => l.user_id === user.id);
        const isSaved = user && post.saves.some(s => s.user_id === user.id);
        
        const likeBtn = document.getElementById('detail-like-btn');
        const saveBtn = document.getElementById('detail-save-btn');
        
        likeBtn.innerHTML = `<i data-lucide="heart" style="${isLiked ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>`;
        saveBtn.innerHTML = `<i data-lucide="bookmark" style="${isSaved ? 'fill: var(--text-main);' : ''}"></i>`;
        
        document.getElementById('detail-like-count').textContent = `${post.likes.length} likes`;
        document.getElementById('detail-time').textContent = new Date(post.created_at).toLocaleDateString();

        // 4. Populate Comments
        const commentsList = document.getElementById('detail-comments-list');
        
        // Add Caption as first "comment"
        let commentsHtml = `
            <div class="detail-comment-item">
                <div class="avatar-sm" style="width: 32px; height: 32px; flex-shrink: 0;">
                    <img src="${post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`}" style="width: 100%; border-radius: 50%;">
                </div>
                <div class="comment-content">
                    <p class="comment-text">
                        <span style="font-weight: 700; margin-right: 6px;">${post.profiles.username}</span>
                        ${post.description || ''}
                    </p>
                </div>
            </div>
        `;

        // Add real comments
        if (post.comments && post.comments.length > 0) {
            commentsHtml += post.comments.map(comment => `
                <div class="detail-comment-item">
                    <div class="avatar-sm" style="width: 32px; height: 32px; flex-shrink: 0;">
                        <img src="${comment.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles.username}`}" style="width: 100%; border-radius: 50%;">
                    </div>
                    <div class="comment-content">
                        <p class="comment-text">
                            <span style="font-weight: 700; margin-right: 6px;">${comment.profiles.username}</span>
                            ${comment.content}
                        </p>
                        <div class="comment-meta">
                            <span>${new Date(comment.created_at).toLocaleDateString()}</span>
                            <span style="font-weight: 600; cursor: pointer;">Reply</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        commentsList.innerHTML = commentsHtml;
        
        // 5. Setup Comment Submission
        const commentInput = document.getElementById('new-comment-input');
        const submitBtn = document.getElementById('submit-comment-btn');
        
        commentInput.oninput = () => {
            submitBtn.disabled = commentInput.value.trim() === '';
        };

        submitBtn.onclick = async () => {
            const content = commentInput.value.trim();
            if (!content || !user) return;

            submitBtn.disabled = true;
            submitBtn.textContent = '...';

            try {
                const { error: commentError } = await window.supabaseClient
                    .from('comments')
                    .insert({
                        post_id: postId,
                        user_id: user.id,
                        content: content
                    });

                if (commentError) throw commentError;
                
                commentInput.value = '';
                openPostModal(postId); // Refresh modal
            } catch (err) {
                console.error('Error adding comment:', err);
            } finally {
                submitBtn.textContent = 'Post';
            }
        };

        modal.classList.add('show');
        lucide.createIcons();

    } catch (err) {
        console.error('Error opening post modal:', err);
    }
}

function closePostModal() {
    const modal = document.getElementById('post-detail-modal');
    if (modal) {
        modal.classList.remove('show');
        // Clear media to stop videos
        document.getElementById('detail-media-container').innerHTML = '';
    }
}

function focusComment(postId) {
    openPostModal(postId).then(() => {
        const input = document.getElementById('new-comment-input');
        if (input) input.focus();
    });
}
