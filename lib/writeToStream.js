'use strict'

var stream = require('stream')
var writeToStream = require('mqtt-packet').writeToStream

function generateStream (output) {
  var input = new stream.Writable({ objectMode: true, write: write })

  function write (chunk, enc, cb) {
    if (writeToStream(chunk, output)) {
      cb()
    } else {
      output.once('drain', cb)
    }
  }

  return input
}

module.exports = generateStream
