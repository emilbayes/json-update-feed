var semver = require('semver')
var xhr = require('simple-get')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var expired = require('expired')

module.exports = Updater
function Updater (url) {
  if (!(this instanceof Updater)) return new Updater(url)

  this.url = url
  this.feed = null
  this.expires = 0

  EventEmitter.call(this)
  this.on('error', function () {}) // Note
}

inherits(Updater, EventEmitter)

Updater.prototype.check = function (version, opts, cb) {
  var self = this
  if (typeof opts === 'function') {
    cb = opts
    opts = null
  }
  if (opts == null) opts = {force: false}
  if (opts.force === false && self.expires > Date.now()) return false

  self.emit('checking-for-update')
  xhr.concat({
    url: self.url,
    json: true
  }, onresponse)

  function ondone (ev, res) {
    self.emit(ev, res)
    if (typeof cb === 'function') return cb(null, res)
  }

  function onerror (err) {
    self.emit('error', err)
    if (typeof cb === 'function') return cb(err)
  }

  function onresponse (err, res, data) {
    if (err) return onerror(err)
    if (res.statusCode > 399) return onerror(new Error('Bad statusCode: ', res.statusCode))

    try {
      var expires = expired.on(res.headers)
      if (expires) self.expires = expires.getTime()
      else self.expires = 0
    } catch (ex) {
      self.expires = 0
    }

    if (data.length === 0) {
      return ondone('update-not-available', false)
    }

    var validFeed = data.every(function (d) {
      return semver.valid(d.version)
    })

    if (!validFeed) {
      var err = new Error('Malformed feed')
      err.data = data
      return ondone(err)
    }

    var sorted = data.sort(function (a, b) {
      return semver.rcompare(a.version, b.version)
    })

    var latest = sorted[0]
    self.feed = sorted

    if (!latest || !latest.version || semver.lte(latest.version, version)) {
      return ondone('update-not-available', false)
    } else {
      return ondone('update-available', latest)
    }
  }
}

Updater.prototype.latest = function (version, cb) {
  var self = this

  if (typeof version == 'function') {
    cb = version
    version = null
  }
  if (version == null) version = ''

  // wait for ready
  if (self.feed == null) return self.check(version, onfeed)
  onfeed(null)


  function onfeed (err, latest) {
    if (err) cb(err)

    var versions = self.feed.map(function (entry) { return entry.version })
    var latest = semver.maxSatisfying(versions, version)

    if (latest == null) return cb(null, false)

    return cb(null, self.feed[versions.indexOf(latest)])
  }
}
