// Reddit API Configuration
const API_BASE = window.location.origin; // Use the same origin as the current page
const REDDIT_API_PROXY = '/api/reddit';

// Application State
let currentSection = 'posts';
let currentPostsFilter = 'hot';
let currentPostsTime = 'day';
let currentSubredditsFilter = 'popular';

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const contentSections = document.querySelectorAll('.content-section');
const postsContainer = document.getElementById('posts-container');
const subredditsContainer = document.getElementById('subreddits-container');
const searchResults = document.getElementById('search-results');
const userContainer = document.getElementById('user-container');
const modal = document.getElementById('post-modal');
const modalBody = document.getElementById('modal-body');

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTime(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
    return Math.floor(diff / 31536000) + 'y ago';
}

function truncateText(text, maxLength = 200) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

function showSuccess(container, message) {
    container.innerHTML = `
        <div class="success">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Reddit API Functions
async function fetchRedditData(endpoint, params = {}) {
    try {
        // Construct the proxy URL
        const proxyUrl = new URL(REDDIT_API_PROXY + endpoint, API_BASE);
        
        // Add parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                proxyUrl.searchParams.append(key, params[key]);
            }
        });

        console.log('Fetching URL:', proxyUrl.toString()); // Debug log

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('API response data:', data); // Debug log
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Posts Functions
async function fetchPosts(filter = 'hot', time = 'day', subreddit = 'all', limit = 25) {
    const endpoint = subreddit === 'all' ? `/${filter}` : `/r/${subreddit}/${filter}`;
    const params = { limit };
    
    if (filter === 'top' && time !== 'all') {
        params.t = time;
    }
    
    return await fetchRedditData(endpoint, params);
}

function renderPost(post) {
    const {
        title,
        selftext,
        author,
        subreddit,
        score,
        num_comments,
        created_utc,
        permalink,
        url,
        is_self,
        thumbnail,
        preview
    } = post.data;

    const postContent = is_self ? truncateText(selftext) : '';
    const imageUrl = preview?.images?.[0]?.source?.url || thumbnail;
    const isImage = imageUrl && imageUrl !== 'self' && imageUrl !== 'default';

    return `
        <div class="post-card" onclick="showPostDetails('${permalink}')">
            <div class="post-header">
                <span class="post-subreddit">r/${subreddit}</span>
                <span class="post-author">by u/${author || '[deleted]'}</span>
            </div>
            <h3 class="post-title">${title}</h3>
            ${postContent ? `<p class="post-content">${postContent}</p>` : ''}
            ${isImage ? `<img src="${imageUrl}" alt="Post image" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            <div class="post-stats">
                <span class="post-stat">
                    <i class="fas fa-arrow-up"></i>
                    ${formatNumber(score)}
                </span>
                <span class="post-stat">
                    <i class="fas fa-comment"></i>
                    ${formatNumber(num_comments)}
                </span>
                <span class="post-stat">
                    <i class="fas fa-clock"></i>
                    ${formatTime(created_utc)}
                </span>
            </div>
        </div>
    `;
}

async function loadPosts() {
    try {
        showLoading(postsContainer);
        const data = await fetchPosts(currentPostsFilter, currentPostsTime);
        
        if (data.data && data.data.children) {
            const postsHTML = data.data.children.map(renderPost).join('');
            postsContainer.innerHTML = postsHTML;
        } else {
            showError(postsContainer, 'No posts found');
        }
    } catch (error) {
        showError(postsContainer, 'Failed to load posts. Please try again.');
    }
}

// Subreddits Functions
async function fetchSubreddits(filter = 'popular', limit = 25) {
    const endpoint = `/subreddits/${filter}`;
    return await fetchRedditData(endpoint, { limit });
}

function renderSubreddit(subreddit) {
    try {
        const {
            display_name,
            display_name_prefixed,
            public_description,
            subscribers,
            active_user_count,
            icon_img,
            banner_img
        } = subreddit.data;

        // Handle null/undefined values
        const safeDisplayName = display_name || 'Unknown';
        const safeDisplayNamePrefixed = display_name_prefixed || `r/${safeDisplayName}`;
        const safePublicDescription = public_description || 'No description available';
        const safeSubscribers = subscribers || 0;
        const safeActiveUserCount = active_user_count || 0;
        
        // Use default icon if icon_img is null, empty, or invalid
        const icon = (icon_img && icon_img !== '' && icon_img !== 'null') 
            ? icon_img 
            : 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';

        return `
            <div class="subreddit-card" onclick="loadSubredditPosts('${safeDisplayName}')">
                <div class="subreddit-header">
                    <div class="subreddit-icon">
                        <img src="${icon}" alt="${safeDisplayName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.src='https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png'">
                    </div>
                    <div class="subreddit-info">
                        <h3>${safeDisplayNamePrefixed}</h3>
                        <p>${truncateText(safePublicDescription, 100)}</p>
                    </div>
                </div>
                <div class="subreddit-stats">
                    <span class="post-stat">
                        <i class="fas fa-users"></i>
                        ${formatNumber(safeSubscribers)} members
                    </span>
                    <span class="post-stat">
                        <i class="fas fa-circle"></i>
                        ${formatNumber(safeActiveUserCount)} online
                    </span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering subreddit:', error, subreddit);
        return `
            <div class="subreddit-card">
                <div class="subreddit-header">
                    <div class="subreddit-icon">
                        <img src="https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png" alt="Unknown" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                    </div>
                    <div class="subreddit-info">
                        <h3>r/Unknown</h3>
                        <p>Unable to load subreddit information</p>
                    </div>
                </div>
            </div>
        `;
    }
}

async function loadSubreddits() {
    try {
        showLoading(subredditsContainer);
        const data = await fetchSubreddits(currentSubredditsFilter);
        
        console.log('Subreddits API response:', data); // Debug log
        
        if (data && data.data && data.data.children && data.data.children.length > 0) {
            const subredditsHTML = data.data.children.map(renderSubreddit).join('');
            subredditsContainer.innerHTML = subredditsHTML;
            console.log(`Successfully loaded ${data.data.children.length} subreddits`);
        } else {
            console.warn('No subreddits data found:', data);
            showError(subredditsContainer, 'No subreddits found');
        }
    } catch (error) {
        console.error('Error loading subreddits:', error);
        showError(subredditsContainer, 'Failed to load subreddits. Please try again.');
    }
}
// Search Functions
async function searchReddit(query, type = 'posts', limit = 25) {
    const endpoint = '/search';
    const params = {
        q: query,
        type: type === 'posts' ? 'link' : type.slice(0, -1), // Reddit API uses 'link' for posts
        limit
    };
    
    return await fetchRedditData(endpoint, params);
}

async function performSearch() {
    const query = document.getElementById('global-search').value.trim();
    const type = document.getElementById('search-type').value;
    
    if (!query) {
        searchResults.innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search"></i>
                <p>Enter your search query above to get started</p>
            </div>
        `;
        return;
    }
    
    try {
        showLoading(searchResults);
        const data = await searchReddit(query, type);
        
        if (data.data && data.data.children && data.data.children.length > 0) {
            let resultsHTML = '';
            
            if (type === 'posts') {
                resultsHTML = data.data.children.map(renderPost).join('');
            } else if (type === 'subreddits') {
                resultsHTML = data.data.children.map(renderSubreddit).join('');
            } else if (type === 'users') {
                resultsHTML = data.data.children.map(renderUser).join('');
            }
            
            searchResults.innerHTML = `
                <div class="section-header">
                    <h3>Search Results for "${query}" (${data.data.children.length} results)</h3>
                </div>
                <div class="${type === 'posts' ? 'posts-grid' : type === 'subreddits' ? 'subreddits-grid' : 'users-grid'}">
                    ${resultsHTML}
                </div>
            `;
        } else {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        }
    } catch (error) {
        showError(searchResults, 'Search failed. Please try again.');
    }
}

// User Functions
function renderUser(user) {
    const {
        name,
        link_karma,
        comment_karma,
        created_utc,
        is_gold,
        is_mod,
        icon_img
    } = user.data;

    const icon = icon_img || 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';

    return `
        <div class="user-card" onclick="loadUserProfile('${name}')">
            <div class="user-header">
                <div class="user-avatar">
                    <img src="${icon}" alt="${name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                </div>
                <div class="user-details">
                    <h3>u/${name}</h3>
                    <div class="user-stats">
                        <div class="user-stat">
                            <div class="user-stat-value">${formatNumber(link_karma)}</div>
                            <div class="user-stat-label">Post Karma</div>
                        </div>
                        <div class="user-stat">
                            <div class="user-stat-value">${formatNumber(comment_karma)}</div>
                            <div class="user-stat-label">Comment Karma</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function fetchUserProfile(username) {
    const endpoint = `/user/${username}/about`;
    return await fetchRedditData(endpoint);
}

async function fetchUserPosts(username, filter = 'hot', limit = 25) {
    const endpoint = `/user/${username}/submitted`;
    return await fetchRedditData(endpoint, { limit });
}

async function loadUserProfile() {
    const username = document.getElementById('username-input').value.trim();
    
    if (!username) {
        userContainer.innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-user"></i>
                <p>Enter a username to view their profile and posts</p>
            </div>
        `;
        return;
    }
    
    try {
        showLoading(userContainer);
        
        const [profileData, postsData] = await Promise.all([
            fetchUserProfile(username),
            fetchUserPosts(username)
        ]);
        
        const user = profileData.data;
        const posts = postsData.data.children || [];
        
        const userHTML = `
            <div class="user-info">
                <div class="user-header">
                    <div class="user-avatar">
                        <img src="${user.icon_img || 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png'}" 
                             alt="${username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                    </div>
                    <div class="user-details">
                        <h3>u/${username}</h3>
                        <div class="user-stats">
                            <div class="user-stat">
                                <div class="user-stat-value">${formatNumber(user.link_karma)}</div>
                                <div class="user-stat-label">Post Karma</div>
                            </div>
                            <div class="user-stat">
                                <div class="user-stat-value">${formatNumber(user.comment_karma)}</div>
                                <div class="user-stat-label">Comment Karma</div>
                            </div>
                            <div class="user-stat">
                                <div class="user-stat-value">${formatTime(user.created_utc)}</div>
                                <div class="user-stat-label">Member Since</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const postsHTML = posts.length > 0 
            ? `<div class="posts-grid">${posts.map(renderPost).join('')}</div>`
            : '<p style="text-align: center; color: #666;">No posts found for this user.</p>';
        
        userContainer.innerHTML = userHTML + postsHTML;
        
    } catch (error) {
        showError(userContainer, 'Failed to load user profile. Please check the username and try again.');
    }
}

// Post Details Modal
async function showPostDetails(permalink) {
    try {
        const data = await fetchRedditData(permalink);
        const post = data[0].data.children[0].data;
        const comments = data[1].data.children;
        
        const modalHTML = `
            <div class="post-details">
                <div class="post-header">
                    <span class="post-subreddit">r/${post.subreddit}</span>
                    <span class="post-author">by u/${post.author || '[deleted]'}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                ${post.selftext ? `<div class="post-content">${post.selftext}</div>` : ''}
                ${post.url && !post.is_self ? `<a href="${post.url}" target="_blank" class="post-link">View Original Content</a>` : ''}
                <div class="post-stats">
                    <span class="post-stat">
                        <i class="fas fa-arrow-up"></i>
                        ${formatNumber(post.score)}
                    </span>
                    <span class="post-stat">
                        <i class="fas fa-comment"></i>
                        ${formatNumber(post.num_comments)}
                    </span>
                    <span class="post-stat">
                        <i class="fas fa-clock"></i>
                        ${formatTime(post.created_utc)}
                    </span>
                </div>
                
                <div class="comments-section">
                    <h3>Comments (${comments.length})</h3>
                    <div class="comments-list">
                        ${comments.slice(0, 10).map(comment => renderComment(comment)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = modalHTML;
        modal.style.display = 'block';
        
    } catch (error) {
        modalBody.innerHTML = '<div class="error">Failed to load post details.</div>';
        modal.style.display = 'block';
    }
}

function renderComment(comment) {
    if (comment.kind === 'more') return '';
    
    const { body, author, score, created_utc } = comment.data;
    
    return `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">u/${author || '[deleted]'}</span>
                <span class="comment-score">${formatNumber(score)} points</span>
                <span class="comment-time">${formatTime(created_utc)}</span>
            </div>
            <div class="comment-body">${body || '[deleted]'}</div>
        </div>
    `;
}

// Navigation Functions
function switchSection(section) {
    // Update navigation
    navTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === section) {
            tab.classList.add('active');
        }
    });
    
    // Update content sections
    contentSections.forEach(contentSection => {
        contentSection.classList.remove('active');
        if (contentSection.id === section) {
            contentSection.classList.add('active');
        }
    });
    
    currentSection = section;
    
    // Load appropriate data
    switch (section) {
        case 'posts':
            loadPosts();
            break;
        case 'subreddits':
            loadSubreddits();
            break;
        case 'search':
            // Clear search results
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Enter your search query above to get started</p>
                </div>
            `;
            break;
        case 'users':
            // Clear user container
            userContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-user"></i>
                    <p>Enter a username to view their profile and posts</p>
                </div>
            `;
            break;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchSection(tab.dataset.section);
        });
    });
    
    // Posts filters
    document.getElementById('posts-filter').addEventListener('change', (e) => {
        currentPostsFilter = e.target.value;
        loadPosts();
    });
    
    document.getElementById('posts-time').addEventListener('change', (e) => {
        currentPostsTime = e.target.value;
        loadPosts();
    });
    
    // Posts search
    document.getElementById('posts-search').addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query) {
            searchReddit(query, 'posts').then(data => {
                if (data.data && data.data.children) {
                    const postsHTML = data.data.children.map(renderPost).join('');
                    postsContainer.innerHTML = postsHTML;
                }
            }).catch(error => {
                showError(postsContainer, 'Search failed');
            });
        } else {
            loadPosts();
        }
    }, 500));
    
    // Subreddits filter
    document.getElementById('subreddits-filter').addEventListener('change', (e) => {
        currentSubredditsFilter = e.target.value;
        loadSubreddits();
    });
    
    // Subreddits search
    document.getElementById('subreddits-search').addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query) {
            searchReddit(query, 'subreddits').then(data => {
                if (data.data && data.data.children) {
                    const subredditsHTML = data.data.children.map(renderSubreddit).join('');
                    subredditsContainer.innerHTML = subredditsHTML;
                }
            }).catch(error => {
                showError(subredditsContainer, 'Search failed');
            });
        } else {
            loadSubreddits();
        }
    }, 500));
    
    // Global search
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('global-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // User profile
    document.getElementById('get-user-btn').addEventListener('click', loadUserProfile);
    document.getElementById('username-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadUserProfile();
        }
    });
    
    // Modal
    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Load initial data
    loadPosts();
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global functions for onclick handlers
window.showPostDetails = showPostDetails;
window.loadUserProfile = loadUserProfile;

async function loadSubredditPosts(subredditName) {
    currentSection = 'posts';
    switchSection('posts');
    
    try {
        showLoading(postsContainer);
        const data = await fetchPosts('hot', 'day', subredditName);
        
        if (data.data && data.data.children) {
            const postsHTML = data.data.children.map(renderPost).join('');
            postsContainer.innerHTML = `
                <div class="section-header">
                    <h2>Posts from r/${subredditName}</h2>
                    <button class="btn btn-primary" onclick="switchSection('posts')">Back to All Posts</button>
                </div>
                <div class="posts-grid">${postsHTML}</div>
            `;
        } else {
            showError(postsContainer, 'No posts found in this subreddit');
        }
    } catch (error) {
        showError(postsContainer, 'Failed to load subreddit posts');
    }
}

window.loadSubredditPosts = loadSubredditPosts;