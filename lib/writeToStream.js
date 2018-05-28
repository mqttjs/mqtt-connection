'use strict'

var stream = require('stream')
var writeToStream = require('mqtt-packet').writeToStream

function StreamGenerator (output, opts) {
  if (!(this instanceof StreamGenerator)) return new StreamGenerator(output, opts)
  var that = this
  this.opts = opts || {}
  var input = new stream.Writable({ objectMode: true, write: write })

  function write (chunk, enc, cb) {
    if (writeToStream(chunk, output, that.opts)) {
      cb()
    } else {
      output.once('drain', cb)
    }
  }

  input.setOptions = function (opts) {
    that.opts = opts
  }

  return input
}

module.exports = StreamGenerator
