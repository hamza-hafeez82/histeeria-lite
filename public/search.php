<?php
require_once __DIR__ . '/../src/env.php';
$activePage = 'search';
include '../src/components/sidebar.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search • Histeeria</title>
    <script>
        window.APP_CONFIG = {
            SUPABASE_URL: "<?php echo getenv('SUPABASE_URL'); ?>",
            SUPABASE_ANON_KEY: "<?php echo getenv('SUPABASE_ANON_KEY'); ?>"
        };
    </script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        .search-page-wrap {
            max-width: 620px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .search-page-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px;
            color: var(--text-main);
        }

        .search-input-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 12px 16px;
            transition: border-color 0.2s;
        }

        .search-input-wrap:focus-within {
            border-color: var(--accent);
        }

        .search-input-wrap input {
            flex: 1;
            background: none;
            border: none;
            outline: none;
            color: var(--text-main);
            font-size: 15px;
        }

        .search-input-wrap input::placeholder {
            color: var(--text-muted);
        }

        .search-results {
            margin-top: 24px;
        }

        .result-count {
            font-size: 13px;
            color: var(--text-muted);
            margin: 0 0 12px;
        }

        .user-result-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
            gap: 12px;
        }

        .user-info-link {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: inherit;
            flex: 1;
            min-width: 0;
        }

        .user-avatar-circle {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            background: var(--bg-hover);
        }

        .user-avatar-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .user-text-wrap {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .user-display-name {
            font-weight: 700;
            font-size: 15px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-full-name {
            font-size: 13px;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .follow-btn {
            padding: 7px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            flex-shrink: 0;
            transition: opacity 0.15s, background 0.2s;
            background: var(--accent);
            color: #fff;
        }

        .follow-btn.following {
            background: var(--bg-hover);
            color: var(--text-main);
            border: 1px solid var(--border-color);
        }

        .follow-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .empty-state {
            text-align: center;
            padding: 70px 20px;
            color: var(--text-muted);
        }

        .empty-state svg {
            display: block;
            margin: 0 auto 16px;
            opacity: 0.35;
        }

        .empty-state h3 {
            margin: 0 0 8px;
            font-size: 18px;
            color: var(--text-main);
        }

        .empty-state p {
            margin: 0;
            font-size: 14px;
        }
    </style>
</head>
<body class="dark-mode">
<div class="app-container">
    <?php renderSidebar($activePage); ?>

    <main class="main-content">
        <div class="search-page-wrap">
            <h2 class="search-page-title">Search</h2>

            <div class="search-input-wrap">
                <i data-lucide="search" style="color: var(--text-muted); flex-shrink: 0;"></i>
                <input type="text" id="search-input" placeholder="Search by username or display name..." autocomplete="off">
                <button id="clear-btn" style="display:none; background:none; border:none; cursor:pointer; color:var(--text-muted); padding:0;" onclick="clearSearch()">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="search-results" id="results-container">
                <div class="empty-state">
                    <i data-lucide="users" style="width:48px; height:48px;"></i>
                    <h3>Find people</h3>
                    <p>Search for friends and creators on Histeeria</p>
                </div>
            </div>
        </div>
    </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/js/supabase.js?v=<?php echo time(); ?>"></script>
<script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
<script>
    const searchInput  = document.getElementById('search-input');
    const resultsEl    = document.getElementById('results-container');
    const clearBtn     = document.getElementById('clear-btn');

    let debounceTimer;

    lucide.createIcons();

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        clearBtn.style.display = q ? 'block' : 'none';

        clearTimeout(debounceTimer);

        if (q.length < 2) {
            showEmpty('Type at least 2 characters to search', 'search');
            return;
        }

        debounceTimer = setTimeout(() => doSearch(q), 300);
    });

    function clearSearch() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        showEmpty('Find people', 'users', 'Search for friends and creators on Histeeria');
    }

    function showEmpty(heading, icon = 'search', sub = '') {
        resultsEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="${icon}" style="width:48px; height:48px;"></i>
                <h3>${heading}</h3>
                ${sub ? `<p>${sub}</p>` : ''}
            </div>`;
        lucide.createIcons();
    }

    async function doSearch(q) {
        resultsEl.innerHTML = `<div class="empty-state"><p style="color:var(--text-muted);">Searching…</p></div>`;

        try {
            const [
                { data: users, error },
                { data: { user: me } }
            ] = await Promise.all([
                window.supabaseClient
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
                    .limit(25),
                window.supabaseClient.auth.getUser()
            ]);

            if (error) throw error;

            if (!users || users.length === 0) {
                resultsEl.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="user-x" style="width:48px; height:48px;"></i>
                        <h3>No results found</h3>
                        <p>No users match "<strong>${escapeHtml(q)}</strong>"</p>
                    </div>`;
                lucide.createIcons();
                return;
            }

            // Bulk-fetch which of these users the current user already follows
            const myFollowSet = new Set();
            if (me) {
                const { data: follows } = await window.supabaseClient
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', me.id)
                    .in('following_id', users.map(u => u.id));
                if (follows) follows.forEach(f => myFollowSet.add(f.following_id));
            }

            const countHtml = `<p class="result-count">${users.length} result${users.length !== 1 ? 's' : ''} for "<strong>${escapeHtml(q)}</strong>"</p>`;

            const rowsHtml = users.map(user => {
                const isMe       = me && user.id === me.id;
                const isFollowing = myFollowSet.has(user.id);
                const avatar     = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;

                return `
                <div class="user-result-item" id="row-${user.id}">
                    <a href="profile.php?id=${user.id}" class="user-info-link">
                        <div class="user-avatar-circle">
                            <img src="${avatar}" alt="${escapeHtml(user.username)}">
                        </div>
                        <div class="user-text-wrap">
                            <span class="user-display-name">${escapeHtml(user.username)}</span>
                            ${user.full_name ? `<span class="user-full-name">${escapeHtml(user.full_name)}</span>` : ''}
                        </div>
                    </a>
                    ${isMe
                        ? `<span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">You</span>`
                        : `<button
                                class="follow-btn ${isFollowing ? 'following' : ''}"
                                data-uid="${user.id}"
                                data-following="${isFollowing}"
                                onclick="toggleFollow('${user.id}', this)">
                                ${isFollowing ? 'Following' : 'Follow'}
                           </button>`
                    }
                </div>`;
            }).join('');

            resultsEl.innerHTML = countHtml + rowsHtml;
            lucide.createIcons();

        } catch (err) {
            console.error('Search error:', err);
            resultsEl.innerHTML = `<div class="empty-state" style="color:#ef4444;"><p>Something went wrong. Please try again.</p></div>`;
        }
    }

    async function toggleFollow(userId, btn) {
        const { data: { user: me } } = await window.supabaseClient.auth.getUser();
        if (!me) return;

        btn.disabled = true;
        const wasFollowing = btn.dataset.following === 'true';

        try {
            if (wasFollowing) {
                await window.supabaseClient
                    .from('follows')
                    .delete()
                    .eq('follower_id', me.id)
                    .eq('following_id', userId);
                btn.textContent   = 'Follow';
                btn.dataset.following = 'false';
                btn.classList.remove('following');
            } else {
                await window.supabaseClient
                    .from('follows')
                    .insert({ follower_id: me.id, following_id: userId });
                btn.textContent   = 'Following';
                btn.dataset.following = 'true';
                btn.classList.add('following');
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
        } finally {
            btn.disabled = false;
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
</script>
</body>
</html>
