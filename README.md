# TheSimpsonsDatabase ![GitHub package.json version](https://img.shields.io/github/package-json/v/MaximMaximS/TSDB?style=for-the-badge) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/MaximMaximS/TSDB?style=for-the-badge)](https://www.codefactor.io/repository/github/maximmaxims/tsdb) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/MaximMaximS/TSDB?style=for-the-badge)](https://github.com/MaximMaximS/TSDB/commits/main)

A simple app to keep track of your watched episodes of The Simpsons.

This is a rewrite of the original project in JS, which is private, because it was a mess.

This repo is for the backend, the frontend ~~can be found~~ _is not yet available_.

The app is in alpha phase, so it isn't really usable yet.

## Features

- [x] Mark episodes as watched
- [x] View episode information including the plot (plot is currently in Czech only)
- [x] Search for episodes
- [x] View number of watched episodes
- [ ] Add episodes to a watchlist
- [ ] View comprehensive statistics

## Usage

Before you can use the application, you need to have a MongoDB cluster running.

Env configuration:

```env
# Configure theses variables to your liking

RATELIMIT_ENABLED=true
RATELIMIT_WINDOW_MS=60000
RATELIMIT_DELAY_AFTER=10
RATELIMIT_DELAY_MS=500
RATELIMIT_MAX=20

MONGODB_URI=<URI>
JWT_SECRET=<RANDOM> # Replace with a random string

PORT=<PORT>
```

### Docker

```shell
# Use the tag from the badge above without the `v`
docker pull maximmaxims/tsdb:<TAG>
docker run -p 3000:<PORT> --env-file ".env" maximmaxims/tsdb:<TAG>
```

### Manually

```shell
git clone https://github.com/MaximMaximS/TSDB.git
cd TSDB
npm install --omit=dev --ignore-scripts
npm run build
npm run start
```

## Getting the episodes

Run the generate-list utility to get the episodes from [Wikipedia](https://cs.wikipedia.org/wiki/Seznam_d%C3%ADl%C5%AF_seri%C3%A1lu_Simpsonovi).
