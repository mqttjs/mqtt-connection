var stream = require('stream')
var writeToStream = require('mqtt-packet').writeToStream
var duplexify = require('duplexify')

function generateStream () {
  var input = new stream.Writable({ objectMode: true, write: write })
  var output = new stream.PassThrough()
  var transform = duplexify(input, output, { objectMode: true })

  function write (chunk, enc, cb) {
    try {
      writeToStream(chunk, output)
    } catch (err) {
      this.emit('error', err)
    }

    cb()
  }

  return transform
}

module.exports = generateStream
