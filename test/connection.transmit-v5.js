/* global describe, it */

/**
 * Testing requires
 */

/**
 * Unit under test
 */

module.exports = function () {
  describe('#subscribe-5.0', function () {
    it('should send a 5.0 subscribe packet (single)', function (done) {
      var expected = Buffer.from([
        130, 10, // Header
        0, 7, // Message id
        0, // Properties
        0, 4, // Topic length
        116, 101, 115, 116, // Topic
        0 // Qos=0
      ])

      var fixture = {
        messageId: 7,
        subscriptions: [
          {
            topic: 'test',
            qos: 0
          }
        ]
      }

      this.conn.subscribe(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })
  })
}
