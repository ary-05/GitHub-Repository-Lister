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
function changePage(change) {
    currentPage += change;

    // Ensure the page number is within bounds
    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    // Update the API request with the new page
    fetchRepos();
}

function fetchRepos() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value;

    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    toggleLoader(true);

    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            const remainingRequests = response.headers.get('X-RateLimit-Remaining');
          //  console.log(remainingRequests);
            if (remainingRequests !== null && parseInt(remainingRequests) < 1) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (!response.ok) {
                throw new Error('Invalid username or unable to fetch user data.');
            }
            return response.json();
        })
        .then(user => {
            totalPages = Math.ceil(user.public_repos / 10);
            const avatar = document.getElementById('avatar');
            const userInfo = document.getElementById('userInfo');
            const about = document.getElementById('bio');
            const location = document.getElementById('location');
            const twitterUrl = document.getElementById('twitter-url');
            const blogUrl = document.getElementById('blog-url');
            const profileSection = document.getElementById('profile-section');
            const gitprofile = document.getElementById('github-profile');

            avatar.src = user.avatar_url;
            userInfo.innerHTML = `<a href=${user.html_url} class="text-decoration-none text-black">${user.name || user.login}</a>`;
            about.innerHTML = user.bio ? `${user.bio}` : "";
            location.innerHTML = user.location ? `🌍 ${user.location}` : "";
            twitterUrl.innerHTML = user.twitter_username ? `Twitter :  <a href="https://twitter.com/${user.twitter_username}" target="_blank"> ${user.twitter_username} </a>` : '';
            blogUrl.innerHTML = user.blog ? `🔗  <a href="${user.blog}" target="_blank">${user.blog}</a>` : '';
            gitprofile.setAttribute('href', user.html_url);
            // Show the profile section
            profileSection.style.display = 'flex';
            
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            alert(error);
        })
        .finally(() => toggleLoader(false));
    //console.log(totalPages);
    const startIndex = (currentPage - 1) * reposPerPage;
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}`;
    const paginationSection = document.getElementById('pagination');
    toggleLoader(true);
    fetch(apiUrl)
        .then(response => {
            const remainingRequests = response.headers.get('X-RateLimit-Remaining');
           // console.log(remainingRequests);
            if (remainingRequests !== null && parseInt(remainingRequests) < 1) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }

            return response.json();
        })
        .then(repos => {
            const reposList = document.getElementById('repos-list');
            reposList.innerHTML = ''; // Clear previous results

            repos.forEach(repo => {
                const repoCard = document.createElement('div');
                repoCard.className = 'repo-card';
                const topicsHtml = repo.topics
                    ? repo.topics.map(topic => `<div class="topics">${topic}</div>`).join('')
                    : '';
                repoCard.innerHTML = `
                        <a href="${repo.html_url}" class="repo-link">
                            <h3 style="color:#3a85c7;">${repo.name}</h3>
                            <p>${repo.description || ''}</p>
                            <div class="topic-container">${topicsHtml}</div>
                        </a>
                    `;

                reposList.appendChild(repoCard);
            });

            updatePagination();
            paginationSection.style.display = 'flex';
            renderPageNumbers();
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            paginationSection.style.display = 'none';
        })
        .finally(() => toggleLoader(false));
}
renderPageNumbers();
function updatePagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageElement = document.getElementById('currentPage');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    currentPageElement.textContent = `Page ${currentPage}/${totalPages}`;
}
function renderPageNumbers() {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number  ${i === currentPage ? 'current-page' : ''}`;
        pageNumber.style="padding:5px 10px; border: 1px solid black;";
        pageNumber.textContent = i;

        pageNumber.addEventListener('click', () => {
            currentPage = i;
            fetchRepos();
        });

        pageNumbersContainer.appendChild(pageNumber);
    }
}
