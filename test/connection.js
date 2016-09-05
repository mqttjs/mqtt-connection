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
      stream.on('readable', () => {
        var data = stream.read(length);
        if (data) {
          cb(data);
        }
      });
    };
  });

  describe('parsing', require('./connection.parse.js'));
  describe('transmission', require('./connection.transmit.js'));
});
