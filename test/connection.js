/* global describe, beforeEach, it */

/**
 * Testing requires
 */

var stream = require('./util').testStream
var should = require('should')

/**
 * Units under test
 */
var Connection = require('../connection')

describe('Connection', function () {
  beforeEach(function () {
    this.stream = stream()
    this.conn = new Connection(this.stream)
    this.readFromStream = (stream, length, cb) => {
      var buf, done
      stream.on('data', data => {
        if (done) return
        buf = buf ? Buffer.concat([ buf, data ]) : data
        if (buf.length >= length) {
          cb(buf.slice(0, length))
          done = true
        }
      })
    }
  })

  it('should start piping in the next tick', function (done) {
    should(this.stream._readableState.flowing).eql(null)
    process.nextTick(() => {
      this.stream._readableState.flowing.should.eql(true)
      done()
    })
  })

  describe('parsing', require('./connection.parse.js'))
  describe('transmission', require('./connection.transmit.js'))
})
