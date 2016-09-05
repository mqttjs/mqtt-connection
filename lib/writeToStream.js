var stream        = require('stream')
  , writeToStream = require('mqtt-packet').writeToStream
  , duplexify     = require('duplexify')

function generateStream() {
  var input = new stream.Writable({ objectMode: true, write: write })
    , output = new stream.PassThrough()
    , transform = duplexify(input, output, { objectMode: true })

  function write(chunk, enc, cb) {
    try {
      writeToStream(chunk, output)
    } catch(err) {
      this.emit('error', err)
    }

    cb()
  }

  return transform
}

module.exports = generateStream;
