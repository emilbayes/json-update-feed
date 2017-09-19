# `json-update-feed`

[![Build Status](https://travis-ci.org/emilbayes/json-update-feed.svg?branch=master)](https://travis-ci.org/emilbayes/json-update-feed)

> Subscribe to a JSON feed for updates

## Usage

```js
var updateFeed = require('json-update-feed')

updateFeed(url)
```

## API

### `var feed = updateFeed(url)`

### `check(semver, [opts], [cb])`

### `latest(semver, [cb])`

### Event: `checking-for-update`

### Event: `update-not-available`

### Event: `update-available`

### Event: `error`

## Install

```sh
npm install json-update-feed
```
## License

[ISC](LICENSE)
