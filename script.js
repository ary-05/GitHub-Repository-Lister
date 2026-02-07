function toggleLoader(show) {
    const loader = document.getElementById('loader');
    const body = document.body;

    if (show) {
        loader.style.display = 'block';
        body.classList.add('loading');
    } else {
        loader.style.display = 'none';
        body.classList.remove('loading');
    }
}

let currentPage = 1;
const reposPerPage = 10;
let totalPages = 0;
let currentUsername = '';

function changePage(change) {
    currentPage += change;

    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    fetchRepos();
}

function fetchRepos() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    // Only reset to page 1 if searching for a new username
    if (username !== currentUsername) {
        currentPage = 1;
    }
    currentUsername = username;
    toggleLoader(true);

    // Fetch user info
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            const remainingRequests = response.headers.get('X-RateLimit-Remaining');
            if (remainingRequests !== null && parseInt(remainingRequests) < 1) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (!response.ok) {
                throw new Error('Invalid username or unable to fetch user data.');
            }
            return response.json();
        })
        .then(user => {
            totalPages = Math.ceil(user.public_repos / reposPerPage);
            displayUserProfile(user);
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            alert(error.message || 'An error occurred while fetching user data.');
        })
        .finally(() => toggleLoader(false));

    // Fetch repositories
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}&sort=updated&direction=desc`;
    toggleLoader(true);

    fetch(apiUrl)
        .then(response => {
            const remainingRequests = response.headers.get('X-RateLimit-Remaining');
            if (remainingRequests !== null && parseInt(remainingRequests) < 1) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (!response.ok) {
                throw new Error('Unable to fetch repositories.');
            }
            return response.json();
        })
        .then(repos => {
            displayRepositories(repos);
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            alert(error.message || 'An error occurred while fetching repositories.');
        })
        .finally(() => toggleLoader(false));
}

function displayUserProfile(user) {
    const avatar = document.getElementById('avatar');
    const userInfo = document.getElementById('userInfo');
    const bio = document.getElementById('bio');
    const location = document.getElementById('location');
    const twitterUrl = document.getElementById('twitter-url');
    const blogUrl = document.getElementById('blog-url');
    const profileSection = document.getElementById('profile-section');
    const gitprofile = document.getElementById('github-profile');

    avatar.src = user.avatar_url;
    avatar.alt = `${user.name || user.login}'s avatar`;
    
    userInfo.innerHTML = `<a href="${user.html_url}" target="_blank" rel="noopener noreferrer">${user.name || user.login}</a>`;
    bio.innerHTML = user.bio ? `<p>${user.bio}</p>` : '';
    location.innerHTML = user.location ? `<span>📍 ${user.location}</span>` : '';
    twitterUrl.innerHTML = user.twitter_username ? `<span>𝕏 <a href="https://twitter.com/${user.twitter_username}" target="_blank" rel="noopener noreferrer">${user.twitter_username}</a></span>` : '';
    blogUrl.innerHTML = user.blog ? `<span>🔗 <a href="${user.blog}" target="_blank" rel="noopener noreferrer">${user.blog}</a></span>` : '';
    
    gitprofile.setAttribute('href', user.html_url);
    gitprofile.setAttribute('target', '_blank');
    gitprofile.setAttribute('rel', 'noopener noreferrer');
    
    profileSection.style.display = 'flex';
}

function displayRepositories(repos) {
    const reposList = document.getElementById('repos-list');
    reposList.innerHTML = '';

    if (repos.length === 0) {
        reposList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No repositories found.</p>';
        return;
    }

    repos.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card';
        
        const topicsHtml = repo.topics && repo.topics.length > 0
            ? repo.topics.map(topic => `<div class="topics">${topic}</div>`).join('')
            : '';

        const description = repo.description ? repo.description.substring(0, 150) : 'No description available';
        
        repoCard.innerHTML = `
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                <h3>${repo.name}</h3>
                <p>${description}${repo.description && repo.description.length > 150 ? '...' : ''}</p>
                <div class="topic-container">${topicsHtml}</div>
            </a>
        `;

        reposList.appendChild(repoCard);
    });

    updatePagination();
    renderPageNumbers();
}

function updatePagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageElement = document.getElementById('currentPage');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    currentPageElement.textContent = `Page ${currentPage} of ${totalPages}`;
}

function renderPageNumbers() {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
        const firstPage = document.createElement('span');
        firstPage.className = 'page-number';
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => {
            currentPage = 1;
            fetchRepos();
        });
        pageNumbersContainer.appendChild(firstPage);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-number';
            ellipsis.textContent = '...';
            ellipsis.style.cursor = 'default';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number ${i === currentPage ? 'current-page' : ''}`;
        pageNumber.textContent = i;

        pageNumber.addEventListener('click', () => {
            currentPage = i;
            fetchRepos();
        });

        pageNumbersContainer.appendChild(pageNumber);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-number';
            ellipsis.textContent = '...';
            ellipsis.style.cursor = 'default';
            pageNumbersContainer.appendChild(ellipsis);
        }

        const lastPage = document.createElement('span');
        lastPage.className = 'page-number';
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => {
            currentPage = totalPages;
            fetchRepos();
        });
        pageNumbersContainer.appendChild(lastPage);
    }
}

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchRepos();
        }
    });
});