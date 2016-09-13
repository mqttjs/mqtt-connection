/**
 * Testing requires
 */
var should = require('should')
  , stream = require('./util').testStream;

/**
 * Units under test
 */
var Connection = require('../connection');


describe('Connection', function() {

  beforeEach(function () {
    this.stream = stream();
    this.conn = new Connection(this.stream);
    this.readFromStream = (stream, length, cb) => {
      var buf, done;
      stream.on('data', data => {
        if (done) return;
        buf = buf ? Buffer.concat([ buf, data ]) : data;
        if (buf.length >= length) {
          cb(buf.slice(0, length));
          done = true;
        }
      });
    };
  });

  describe('parsing', require('./connection.parse.js'));
  describe('transmission', require('./connection.transmit.js'));
});
