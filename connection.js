'use strict'

var generateStream = require('./lib/generateStream')
var parseStream = require('./lib/parseStream')
var writeToStream = require('./lib/writeToStream')
var Duplexify = require('duplexify')
var inherits = require('inherits')

function emitPacket (packet) {
  this.emit(packet.cmd, packet)
}

function Connection (duplex, opts) {
  if (!(this instanceof Connection)) {
    return new Connection(duplex, opts)
  }

  opts = opts || {}

  var inStream = writeToStream(duplex)
  var outStream = parseStream(opts)

  // defer piping, so consumer can attach event listeners
  // otherwise we might lose events
  process.nextTick(() => {
    duplex.pipe(outStream)
  })

  inStream.on('error', this.emit.bind(this, 'error'))
  outStream.on('error', this.emit.bind(this, 'error'))

  this.stream = duplex

  duplex.on('error', this.emit.bind(this, 'error'))
  duplex.on('close', this.emit.bind(this, 'close'))

  Duplexify.call(this, inStream, outStream, { objectMode: true })

  // MQTT.js basic default
  if (opts.notData !== true) this.on('data', emitPacket)
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
  'disconnect'].forEach(function (cmd) {
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

module.exports = Connection
module.exports.parseStream = parseStream
module.exports.generateStream = generateStream
