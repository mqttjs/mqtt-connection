'use strict'

var generateStream = require('./lib/generateStream')
var parseStream = require('./lib/parseStream')
var writeToStream = require('./lib/writeToStream')
var Duplexify = require('duplexify')
var inherits = require('inherits')

function emitPacket (packet) {
  this.emit(packet.cmd, packet)
}

function Connection (duplex, opts, cb) {
  if (!(this instanceof Connection)) {
    return new Connection(duplex, opts)
  }

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  this._generator = writeToStream(duplex, opts)
  this._parser = parseStream(opts)

  // defer piping, so consumer can attach event listeners
  // otherwise we might lose events
  process.nextTick(() => {
    duplex.pipe(this._parser)
  })

  this._generator.on('error', this.emit.bind(this, 'error'))
  this._parser.on('error', this.emit.bind(this, 'error'))

  this.stream = duplex

  duplex.on('error', this.emit.bind(this, 'error'))
  duplex.on('close', this.emit.bind(this, 'close'))

  Duplexify.call(this, this._generator, this._parser, { objectMode: true })

  // MQTT.js basic default
  if (opts.notData !== true) {
    var that = this
    this.once('data', function (connectPacket) {
      that.setOptions(connectPacket)
      that.on('data', emitPacket)
      if (cb) {
        cb()
      }
      that.emit('data', connectPacket)
    })
  }
}

inherits(Connection, Duplexify)

;['connect',
  'connack',
  'publish',
  'puback',
  'pubrec',
  'pubrel',
  'pubcomp',
  'subscribe',
  'suback',
  'unsubscribe',
  'unsuback',
  'pingreq',
  'pingresp',
  'disconnect',
  'auth'
].forEach(function (cmd) {
  Connection.prototype[cmd] = function (opts, cb) {
    opts = opts || {}
    opts.cmd = cmd

    // Flush the buffer if needed
    // UGLY hack, we should listen for the 'drain' event
    // and start writing again, but this works too
    this.write(opts)
    if (cb) setImmediate(cb)
  }
})

Connection.prototype.destroy = function () {
  if (this.stream.destroy) this.stream.destroy()
  else this.stream.end()
}

Connection.prototype.setOptions = function (opts) {
  this.options = opts
  this._parser.setOptions(opts)
  this._generator.setOptions(opts)
}

module.exports = Connection
module.exports.parseStream = parseStream
module.exports.generateStream = generateStream
