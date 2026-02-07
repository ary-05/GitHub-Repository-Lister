# RepoExplore 🚀

A simple GitHub Explorer that fetches and displays any user's public repositories using the GitHub REST API.

## Features

- Search any GitHub username
- View profile info (avatar, bio, links)
- Paginated repository listing
- Repository topics & descriptions
- Responsive UI

## Tech Stack

- HTML
- CSS
- JavaScript
- GitHub REST API

## Run Locally

Clone the repo:

```bash
git clone https://github.com/ary-05/RepoExplore.git
cd RepoExplore
```

Open in browser:

just double-click `index.html`.

## How It Works

- Fetches user data from:
  https://api.github.com/users/{username}

- Fetches repositories with pagination:
  https://api.github.com/users/{username}/repos
---

Simple. Clean. No backend. Just pure frontend + GitHub API.
