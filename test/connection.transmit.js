/* global describe, it */

/**
 * Testing requires
 */

var stream = require('./util').testStream

/**
 * Unit under test
 */

var Connection = require('../connection')

module.exports = function () {
  describe('#connect', function () {
    it('should send a connect packet (minimal)', function (done) {
      var expected = Buffer.from([
        16, 18, // Header
        0, 6, 77, 81, 73, 115, 100, 112, // Protocol Id
        3, // Protocol version
        0, // Connect flags
        0, 30, // Keepalive
        0, 4, // Client id length
        116, 101, 115, 116 // Client Id
      ])

      var fixture = {
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clientId: 'test',
        keepalive: 30,
        clean: false
      }

      this.conn.connect(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a connect packet (maximal)', function (done) {
      var expected = Buffer.from([
        16, 54, // Header
        0, 6, 77, 81, 73, 115, 100, 112, // Protocol Id
        3, // Protocol version
        246, // Connect flags (u=1,p=1,wr=1,wq=2,wf=1,c=1)
        0, 30, // Keepalive (30)
        0, 4, // Client id length
        116, 101, 115, 116, // Client Id
        0, 5, // Will topic length
        116, 111, 112, 105, 99, // Will topic ('topic')
        0, 7, // Will payload length
        112, 97, 121, 108, 111, 97, 100, // ('payload')
        0, 8, // Username length
        117, 115, 101, 114, 110, 97, 109, 101, // ('username')
        0, 8, // Password length
        112, 97, 115, 115, 119, 111, 114, 100 // ('password')
      ])

      var fixture = {
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clientId: 'test',
        keepalive: 30,
        will: {
          topic: 'topic',
          payload: 'payload',
          qos: 2,
          retain: true
        },
        clean: true,
        username: 'username',
        password: 'password'
      }

      this.conn.connect(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a connect packet with binary username/password', function (done) {
      var expected = Buffer.from([
        16, 28, // Header
        0, 6, 77, 81, 73, 115, 100, 112, // Protocol Id
        3, // Protocol version
        0x40 | 0x80, // Connect flags
        0, 30, // Keepalive
        0, 4, // Client id length
        116, 101, 115, 116, // Client Id
        0, 3, // Username length
        12, 13, 14, // Username
        0, 3, // Password length
        15, 16, 17 // Password
      ])

      var fixture = {
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clientId: 'test',
        keepalive: 30,
        clean: false,
        username: Buffer.from([12, 13, 14]),
        password: Buffer.from([15, 16, 17])
      }

      var s = stream()
      var c = new Connection(s, { encoding: 'binary' })

      s.removeAllListeners()
      c.connect(fixture)

      this.readFromStream(s, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a connect packet with binary will payload', function (done) {
      var expected = Buffer.from([
        16, 50, // Header
        0, 6, 77, 81, 73, 115, 100, 112, // Protocol Id
        3, // Protocol version
        246, // Connect flags
        0, 30, // Keepalive
        0, 4, // Client id length
        116, 101, 115, 116, // Client Id
        0, 5, // Will topic length
        116, 111, 112, 105, 99, // Will topic ('topic')
        0, 3, // Will payload length
        18, 19, 20, // Will payload
        0, 8, // Username length
        117, 115, 101, 114, 110, 97, 109, 101, // ('username')
        0, 8, // Password length
        112, 97, 115, 115, 119, 111, 114, 100 // ('password')
      ])

      var fixture = {
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clientId: 'test',
        keepalive: 30,
        will: {
          topic: 'topic',
          payload: Buffer.from([18, 19, 20]),
          qos: 2,
          retain: true
        },
        clean: true,
        username: 'username',
        password: 'password'
      }

      var s = stream()
      var c = new Connection(s, { encoding: 'binary' })

      s.removeAllListeners()
      c.connect(fixture)

      this.readFromStream(s, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a connect packet with unicode will payload', function (done) {
      var expected = Buffer.from([
        16, 49, // Header
        0, 6, 77, 81, 73, 115, 100, 112, // Protocol Id
        3, // Protocol version
        246, // Connect flags
        0, 30, // Keepalive
        0, 4, // Client id length
        116, 101, 115, 116, // Client Id
        0, 5, // Will topic length
        116, 111, 112, 105, 99, // Will topic ('topic')
        0, 2, // Will payload length
        194, 167, // Will payload - '§'
        0, 8, // Username length
        117, 115, 101, 114, 110, 97, 109, 101, // ('username')
        0, 8, // Password length
        112, 97, 115, 115, 119, 111, 114, 100 // ('password')
      ])

      var fixture = {
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clientId: 'test',
        keepalive: 30,
        will: {
          topic: 'topic',
          payload: '§',
          qos: 2,
          retain: true
        },
        clean: true,
        username: 'username',
        password: 'password'
      }

      var s = stream()
      var c = new Connection(s, { encoding: 'binary' })

      s.removeAllListeners()
      c.connect(fixture)

      this.readFromStream(s, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    describe('invalid options', function () {
      describe('protocol id', function () {
        it('should reject non-string', function (done) {
          var fixture = {
            protocolId: 42,
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 30
          }

          var expectedErr = 'Invalid protocolId'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('protocol version', function () {
        it('should reject non-number', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: [],
            clientId: 'test',
            keepalive: 30
          }

          var expectedErr = 'Invalid protocol version'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject >255', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 300,
            clientId: 'test',
            keepalive: 30
          }

          var expectedErr = 'Invalid protocol version'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject <0', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: -20,
            clientId: 'test',
            keepalive: 30
          }

          var expectedErr = 'Invalid protocol version'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('client id', function () {
        it('should reject non-present', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            keepalive: 30
          }

          var expectedErr = 'clientId must be supplied before 3.1.1'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject empty', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: '',
            keepalive: 30
          }

          var expectedErr = 'clientId must be supplied before 3.1.1'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject non-string', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: {},
            keepalive: 30
          }

          var expectedErr = 'clientId must be supplied before 3.1.1'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('keepalive', function () {
        it('should reject non-number', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 'blah'
          }

          var expectedErr = 'Invalid keepalive'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject < 0', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: -2
          }

          var expectedErr = 'Invalid keepalive'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject > 65535', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 65536
          }

          var expectedErr = 'Invalid keepalive'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('will', function () {
        it('should reject non-object', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 30,
            will: 'test'
          }

          var expectedErr = 'Invalid will'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })

        it('should reject will without valid topic',
          function (done) {
            var fixture = {
              protocolId: 'MQIsdp',
              protocolVersion: 3,
              clientId: 'test',
              keepalive: 30,
              will: {
                topic: 0,
                payload: 'test',
                qos: 0,
                retain: false
              }
            }

            var expectedErr = 'Invalid will topic'

            this.conn.once('error', function (error) {
              error.message.should.equal(expectedErr)
              done()
            })

            this.conn.connect(fixture)
          })

        it('should reject will without valid payload',
          function (done) {
            var fixture = {
              protocolId: 'MQIsdp',
              protocolVersion: 3,
              clientId: 'test',
              keepalive: 30,
              will: {
                topic: 'test',
                payload: 42,
                qos: 0,
                retain: false
              }
            }

            var expectedErr = 'Invalid will payload'

            this.conn.once('error', function (error) {
              error.message.should.equal(expectedErr)
              done()
            })

            this.conn.connect(fixture)
          })

        it.skip('should reject will with invalid qos', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 30,
            will: {
              topic: 'test',
              payload: 'test',
              qos: '',
              retain: false
            }
          }

          var expectedErr = 'Invalid will qos'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('username', function () {
        it('should reject invalid username', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 30,
            username: 30
          }

          var expectedErr = 'Invalid username'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })

      describe('password', function () {
        it('should reject invalid password', function (done) {
          var fixture = {
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clientId: 'test',
            keepalive: 30,
            password: 30
          }

          var expectedErr = 'Invalid password'

          this.conn.once('error', function (error) {
            error.message.should.equal(expectedErr)
            done()
          })

          this.conn.connect(fixture)
        })
      })
    })
  })

  describe('#connack', function () {
    it('should send a connack packet (rc = 0)', function (done) {
      var expected = Buffer.from([
        32, 2, // Header
        0, 0 // Rc=0
      ])

      var fixture = {
        returnCode: 0
      }

      this.conn.connack(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a connack packet (rc = 4)', function (done) {
      var expected = Buffer.from([
        32, 2, // Header
        0, 4 // Rc=0
      ])

      var fixture = {
        returnCode: 4
      }

      this.conn.connack(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid rc', function (done) {
      this.conn.once('error', function (error) {
        error.message.should.equal('Invalid return code')
        done()
      })
      this.conn.connack({returnCode: 'asdf'})
    })
  })

  describe('#publish', function () {
    it('should send a publish packet (minimal)', function (done) {
      var expected = Buffer.from([
        48, 10, // Header
        0, 4, // Topic length
        116, 101, 115, 116, // Topic ('test')
        116, 101, 115, 116 // Payload ('test')
      ])

      var fixture = {
        topic: 'test',
        payload: 'test'
      }

      this.conn.publish(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a publish packet (maximal)', function (done) {
      var expected = Buffer.from([
        61, 12, // Header
        0, 4, // Topic length
        116, 101, 115, 116, // Topic ('test')
        0, 7, // Message id (7)
        116, 101, 115, 116 // Payload ('test')
      ])

      var fixture = {
        topic: 'test',
        payload: 'test',
        qos: 2,
        retain: true,
        dup: true,
        messageId: 7
      }

      this.conn.publish(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a publish packet (empty)', function (done) {
      var expected = Buffer.from([
        48, 6, // Header
        0, 4, // Topic length
        116, 101, 115, 116 // Topic ('test')
        // Empty payload
      ])

      var fixture = {
        topic: 'test'
      }

      this.conn.publish(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a publish packet (buffer)', function (done) {
      var expected = Buffer.from([
        48, 10, // Header
        0, 4, // Topic length
        116, 101, 115, 116, // Topic ('test')
        0, 0, 0, 0 // Payload
      ])
      var buf = Buffer.allocUnsafe(4)
      buf.fill(0)

      var fixture = {
        topic: 'test',
        payload: buf
      }

      this.conn.publish(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a publish packet of 2KB', function (done) {
      var expected = Buffer.from([
        48, 134, 16, // Header
        0, 4, // Topic length
        116, 101, 115, 116 // Topic ('test')
      ])
      var payload = Buffer.allocUnsafe(2048)

      expected = Buffer.concat([expected, payload])

      var fixture = {
        topic: 'test',
        payload: payload
      }

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })

      this.conn.publish(fixture)
      this.conn.end()
    })

    it('should send a publish packet of 2MB', function (done) {
      var expected = Buffer.from([
        48, 134, 128, 128, 1, // Header
        0, 4, // Topic length
        116, 101, 115, 116 // Topic ('test')
      ])
      var payload = Buffer.allocUnsafe(2 * 1024 * 1024)

      expected = Buffer.concat([expected, payload])

      var fixture = {
        topic: 'test',
        payload: payload
      }

      this.conn.publish(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        // Comparing the whole 2MB buffer is very slow so only check the length
        data.length.should.eql(expected.length)
        done()
      })
    })

    it('should reject invalid topic', function (done) {
      var error = 'Invalid topic'

      this.conn.once('error', function (err) {
        err.message.should.equal(error)
        done()
      })
      this.conn.publish({topic: 0})
    })
    it('should reject invalid payloads, maybe')
    it('should reject invalid mid', function (done) {
      this.conn.once('error', function (err) {
        err.message.should.equal('Invalid messageId')
        done()
      })
      this.conn.publish({topic: 'test', messageId: '', qos: 1})
    })
  })

  describe('#puback', function () {
    it('should send a puback packet', function (done) {
      var expected = Buffer.from([
        64, 2, // Header
        0, 30 // Mid=30
      ])

      var fixture = {
        messageId: 30
      }

      this.conn.puback(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid', function (done) {
      this.conn.once('error', function (error) {
        error.message.should.equal('Invalid messageId')
        done()
      })
      this.conn.puback({messageId: ''})
    })
  })

  describe('#pubrec', function () {
    it('should send a pubrec packet', function (done) {
      var expected = Buffer.from([
        80, 2, // Header
        0, 3 // Mid=3
      ])

      var fixture = {
        messageId: 3
      }

      this.conn.pubrec(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid')
  })

  describe('#pubrel', function () {
    it('should send a pubrel packet', function (done) {
      var expected = Buffer.from([
        98, 2, // Header
        0, 6 // Mid=6
      ])

      var fixture = {
        messageId: 6
      }

      this.conn.pubrel(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid')
  })

  describe('#pubcomp', function () {
    it('should send a pubcomp packet', function (done) {
      var expected = Buffer.from([
        112, 2, // Header
        0, 9 // Mid=9
      ])

      var fixture = {
        messageId: 9
      }

      this.conn.pubcomp(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid')
  })

  describe('#subscribe', function () {
    it('should send a subscribe packet (single)', function (done) {
      var expected = Buffer.from([
        130, 9, // Header
        0, 7, // Message id
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

    it('should send a subscribe packet (multiple)', function (done) {
      var expected = Buffer.from([
        130, 23, // Header
        0, 8, // Message id
        0, 4, // Topic length
        116, 101, 115, 116, // Topic ('test')
        0, // Qos=0
        0, 4, // Topic length
        117, 101, 115, 116, // Topic ('uest')
        1, // Qos=1
        0, 4, // Topic length
        116, 101, 115, 115, // Topic ('tess')
        2 // Qos=2
      ])

      var fixture = {
        messageId: 8,
        subscriptions: [
          {
            topic: 'test',
            qos: 0
          }, {
            topic: 'uest',
            qos: 1
          }, {
            topic: 'tess',
            qos: 2
          }
        ]
      }

      this.conn.subscribe(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })
    it('should reject invalid subscriptions', function (done) {
      this.conn.once('error', function (error) {
        error.message.should.equal('Invalid subscriptions')
        done()
      })
      this.conn.subscribe({
        messageId: 1, subscriptions: ''
      })
    })

    it('should reject invalid subscription objects')
    it('should reject invalid mid', function (done) {
      this.conn.once('error', function (error) {
        error.message.should.equal('Invalid messageId')
        done()
      })
      this.conn.subscribe({
        messageId: '', subscriptions: [{topic: 'test', qos: 1}]
      })
    })
  })

  describe('#suback', function () {
    it('should send a suback packet', function (done) {
      var expected = Buffer.from([
        144, 5, // Length
        0, 4, // Mid=4
        0, // Qos=0
        1, // Qos=1
        2 // Qos=2
      ])

      var fixture = {
        granted: [0, 1, 2],
        messageId: 4
      }

      this.conn.suback(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid')
    it('should reject invalid qos vector', function (done) {
      this.conn.on('error', function (error) {
        error.message.should.equal('Invalid qos vector')
        done()
      })
      this.conn.suback({granted: '', messageId: 1})
    })
  })

  describe('#unsubscribe', function () {
    it('should send an unsubscribe packet', function (done) {
      var expected = Buffer.from([
        162, 14, // Header
        0, 6, // Mid=6
        0, 4, // Topic length
        116, 101, 115, 116, // Topic ('test')
        0, 4, // Topic length
        116, 115, 101, 116 // Topic ('tset')
      ])

      var fixture = {
        messageId: 6,
        unsubscriptions: [
          'test', 'tset'
        ]
      }

      this.conn.unsubscribe(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid unsubs', function (done) {
      this.conn.once('error', function (error) {
        error.message.should.equal('Invalid unsubscriptions')
        done()
      })
      this.conn.unsubscribe({
        messageId: 1,
        unsubscriptions: ''
      })
    })
    it('should reject invalid mids')
  })

  describe('#unsuback', function () {
    it('should send a unsuback packet', function (done) {
      var expected = Buffer.from([
        176, 2, // Header
        0, 8 // Mid=8
      ])

      var fixture = {
        messageId: 8
      }

      this.conn.unsuback(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should reject invalid mid')
  })

  describe('#pingreq', function () {
    it('should send a pingreq packet', function (done) {
      var expected = Buffer.from([
        192, 0 // Header
      ])

      var fixture = {
      }

      this.conn.pingreq(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })
  })

  describe('#pingresp', function () {
    it('should send a pingresp packet', function (done) {
      var expected = Buffer.from([
        208, 0 // Header
      ])

      var fixture = {
      }

      this.conn.pingresp(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })
  })

  describe('#disconnect', function () {
    it('should send a disconnect packet', function (done) {
      var expected = Buffer.from([
        224, 0 // Header
      ])

      var fixture = {
      }

      this.conn.disconnect(fixture)

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })

    it('should send a null disconnect packet', function (done) {
      var expected = Buffer.from([
        224, 0 // Header
      ])

      this.conn.disconnect()

      this.readFromStream(this.stream, expected.length, data => {
        data.should.eql(expected)
        done()
      })
    })
  })
}
