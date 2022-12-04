# The Quoter ![GitHub package.json version](https://img.shields.io/github/package-json/v/MaximMaximS/TSDB?style=for-the-badge) [![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/MaximMaximS/TSDB?style=for-the-badge)](https://www.codefactor.io/repository/github/maximmaxims/tsdb) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/MaximMaximS/TSDB?style=for-the-badge)](https://github.com/MaximMaximS/TSDB/commits/main)

## Usage

Be aware that the application is not yet fully functional.

Before you can use the application, you need to have a MongoDB cluster running.

Env configuration:

```env
# Configure theses variables to your liking
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
