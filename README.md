mqtt-connection
===============

Barebone Connection object for MQTT.
Works over any kind of binary Streams, TCP, TLS, WebSocket, ...

It uses [mqtt-packet](http://npm.im/mqtt-packet) for generating and
parsing MQTT packets. See it for the full documentations on the
packet types.

Acknowledgements
----------------

This library has been extracted and refactored from
[MQTT.js](http://github.com/adamvr/MQTT.js). Thanks [Adam Rudd](http://github.com/adamvr) for the great module.

Install
-------

```sh
npm install mqtt-connection --save
```

Usage
-----

As a client:

```js
var net     = require('net')
  , mqttCon = require('mqtt-connection')
  , stream  = net.createConnection(1883, 'localhost')
  , conn    = mqttCon(stream);

// conn is your MQTT connection!

```

As a server:
```js
var net     = require('net')
  , mqttCon = require('mqtt-connection')
  , server  = new net.Server();

server.on('connection', function(stream) {
  var conn = mqttCon(stream);

  // conn is your MQTT connection!
});
```

API
---

Creates a new MQTT `Connection`.

Options:

  * `encoding`: encoding of the payload. See [buffer docs](http://nodejs.org/api/buffer.html#buffer_buffer)
  * `notData`: do not listen to the `'data'` event, so that it can
    respect backpressure. Pipe the `Connection` to another stream to
    consume the packets. If this option is passed `true` the object will
    emit no packet-related events.

### Connection#connect(options, [callback])

Send an MQTT connect packet.

`options` supports the following properties:

* `protocolId`: Protocol ID, usually `MQIsdp`. `string`
* `protocolVersion`: Protocol version, usually 3. `number`
* `keepalive`: keepalive period in seconds. `number`
* `clientId`: client ID. `string`
* `will`: the client's will message options. 
`object` that supports the following properties:
  * `topic`: the will topic. `string`
  * `payload`: the will payload. `string`
  * `qos`: will qos level. `number`
  * `retain`: will retain flag. `boolean`
* `clean`: the 'clean start' flag. `boolean`
* `username`: username for protocol v3.1. `string`
* `password`: password for protocol v3.1. `string`

### Connection#connack(options, [callback])
Send an MQTT connack packet.

`options` supports the following properties:

* `returnCode`: the return code of the connack, success is
indicated by `0`. `number`

### Connection#publish(options, [callback])
Send an MQTT publish packet.

`options` supports the following properties:

* `topic`: the topic to publish to. `string`
* `payload`: the payload to publish, defaults to an empty buffer. 
`string` or `buffer`
* `qos`: the quality of service level to publish on. `number`
* `messageId`: the message ID of the packet, 
required if qos > 0. `number`
* `retain`: retain flag. `boolean`

### Connection#puback #pubrec #pubcomp #unsuback(options, [callback])
Send an MQTT `[puback, pubrec, pubcomp, unsuback]` packet.

`options` supports the following properties:

* `messageId`: the ID of the packet

### Connection#pubrel(options, [callback])
Send an MQTT pubrel packet.

`options` supports the following properties:

* `dup`: duplicate message flag
* `messageId`: the ID of the packet

### Connection#subscribe(options, [callback])
Send an MQTT subscribe packet.

`options` supports the following properties:

* `dup`: duplicate message flag
* `messageId`: the ID of the packet
* `subscriptions`: a list of subscriptions of the form 
`[{topic: a, qos: 0}, {topic: b, qos: 1}]` 

### Connection#suback(options, [callback])
Send an MQTT suback packet.

`options` supports the following properties:

* `granted`: a vector of granted QoS levels, 
of the form `[0, 1, 2]`
* `messageId`: the ID of the packet

### Connection#unsubscribe(options, [callback])
Send an MQTT unsubscribe packet.

`options` supports the following properties:

* `messageId`: the ID of the packet
* `dup`: duplicate message flag
* `unsubscriptions`: a list of topics to unsubscribe from, 
of the form `["topic1", "topic2"]`

### Connection#pingreq #pingresp #disconnect(options, [callback])
Send an MQTT `[pingreq, pingresp, disconnect]` packet.

### Event: 'connect'
`function(packet) {}`

Emitted when an MQTT connect packet is received by the client.

`packet` is an object that may have the following properties:

* `version`: the protocol version string
* `versionNum`: the protocol version number
* `keepalive`: the client's keepalive period
* `clientId`: the client's ID
* `will`: an object with the following keys:
  * `topic`: the client's will topic
  * `payload`: the will message
  * `retain`: will retain flag
  * `qos`: will qos level
* `clean`: clean start flag
* `username`: v3.1 username
* `password`: v3.1 password

### Event: 'connack'
`function(packet) {}`

Emitted when an MQTT connack packet is received by the client.

`packet` is an object that may have the following properties:

* `returnCode`: the return code of the connack packet

### Event: 'publish'
`function(packet) {}`

Emitted when an MQTT publish packet is received by the client.

`packet` is an object that may have the following properties:

* `topic`: the topic the message is published on
* `payload`: the payload of the message
* `messageId`: the ID of the packet
* `qos`: the QoS level to publish at

### Events: \<'puback', 'pubrec', 'pubrel', 'pubcomp', 'unsuback'\>
`function(packet) {}`

Emitted when an MQTT `[puback, pubrec, pubrel, pubcomp, unsuback]` 
packet is received by the client.

`packet` is an object that may contain the property:

* `messageId`: the ID of the packet

### Event: 'subscribe'
`function(packet) {}`

Emitted when an MQTT subscribe packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `subscriptions`: an array of objects 
representing the subscribed topics, containing the following keys
  * `topic`: the topic subscribed to
  * `qos`: the qos level of the subscription


### Event: 'suback'
`function(packet) {}`

Emitted when an MQTT suback packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `granted`: a vector of granted QoS levels

### Event: 'unsubscribe'
`function(packet) {}`

Emitted when an MQTT unsubscribe packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `unsubscriptions`: a list of topics the client is 
unsubscribing from, of the form `[topic1, topic2, ...]`

### Events: \<'pingreq', 'pingresp', 'disconnect'\>
`function(packet){}`

Emitted when an MQTT `[pingreq, pingresp, disconnect]` packet is received.

`packet` only includes static header information and can be ignored.

License
-------

MIT
