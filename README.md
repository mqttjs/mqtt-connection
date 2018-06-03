mqtt-connection&nbsp;&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mqttjs/mqtt-connection.png)](https://travis-ci.org/mqttjs/mqtt-connection)
===============

Barebone Connection object for MQTT.
Works over any kind of binary Streams, TCP, TLS, WebSocket, ...

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

It uses [mqtt-packet](http://npm.im/mqtt-packet) for generating and
parsing MQTT packets. See it for the full documentations on the
packet types.

  * <a href="#installation">Installation</a>
  * <a href="#usage">Usage</a>
  * <a href="#api">API</a>
  * <a href="#contributing">Contributing</a>
  * <a href="#license">License &amp; copyright</a>

This library is tested with node v4, v6 and v7. The last version to support
older versions of node was mqtt-connection@2.1.1.

Installation
-------

```sh
npm install mqtt-connection --save
```

Usage
-----

As a client:

```js
var net = require('net')
var mqttCon = require('mqtt-connection')
var stream = net.createConnection(1883, 'localhost')
var conn = mqttCon(stream)

// conn is your MQTT connection!
```

As a server:
```js
var net = require('net')
var mqttCon = require('mqtt-connection')
var server = new net.Server()

server.on('connection', function (stream) {
  var client = mqttCon(stream)

  // client connected
  client.on('connect', function (packet) {
    // acknowledge the connect packet
    client.connack({ returnCode: 0 });
  })

  // client published
  client.on('publish', function (packet) {
    // send a puback with messageId (for QoS > 0)
    client.puback({ messageId: packet.messageId })
  })

  // client pinged
  client.on('pingreq', function () {
    // send a pingresp
    client.pingresp()
  });

  // client subscribed
  client.on('subscribe', function (packet) {
    // send a suback with messageId and granted QoS level
    client.suback({ granted: [packet.qos], messageId: packet.messageId })
  })

  // timeout idle streams after 5 minutes
  stream.setTimeout(1000 * 60 * 5)

  // connection error handling
  client.on('close', function () { client.destroy() })
  client.on('error', function () { client.destroy() })
  client.on('disconnect', function () { client.destroy() })

  // stream timeout
  stream.on('timeout', function () { client.destroy(); })
})

// listen on port 1883
server.listen(1883)
```

As a websocket server:

```js
var websocket = require('websocket-stream')
var WebSocketServer = require('ws').Server
var Connection = require('mqtt-connection')
var server = http.createServer()

var wss = new WebSocketServer({server: server})

if (handler) {
  server.on('client', handler)
}

wss.on('connection', function (ws) {
  var stream = websocket(ws)
  var connection = new Connection(stream)

  handle(connection)
})

function handle (conn) {
  // handle the MQTT connection like
  // the net example
}
```

API
---

  * <a href="#connection"><code>mqtt.<b>Connection()</b></code></a>
  * <a href="#parseStream"><code>mqtt.<b>parseStream()</b></code></a>
  * <a href="#generateStream"><code>mqtt.<b>generateStream()</b></code></a>

---------------------------------

<a name="connection"></a>
### new mqtt.Connection([options])

Creates a new MQTT `Connection`.

Options:

  * `notData`: do not listen to the `'data'` event, so that it can
    respect backpressure. Pipe the `Connection` to another stream to
    consume the packets. If this option is passed `true` the object will
    emit no packet-related events.

#### Connection#connect(options, [callback])

Send a MQTT connect packet.

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
  * `properties`: properties of will by MQTT 5.0:
      * `willDelayInterval`: representing the Will Delay Interval in seconds `number`,
      * `payloadFormatIndicator`: Will Message is UTF-8 Encoded Character Data or not `boolean`,
      * `messageExpiryInterval`: value is the lifetime of the Will Message in seconds and is sent as the Publication Expiry Interval when the Server publishes the Will Message `number`,
      * `contentType`: describing the content of the Will Message `string`,
      * `responseTopic`: String which is used as the Topic Name for a response message `string`,
      * `correlationData`: The Correlation Data is used by the sender of the Request Message to identify which request the Response Message is for when it is received `binary`,
      * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`
* `properties`: properties MQTT 5.0.
`object` that supports the following properties:
    * `sessionExpiryInterval`: representing the Session Expiry Interval in seconds `number`,
    * `receiveMaximum`: representing the Receive Maximum value `number`,
    * `maximumPacketSize`: representing the Maximum Packet Size the Client is willing to accept `number`,
    * `topicAliasMaximum`: representing the Topic Alias Maximum value indicates the highest value that the Client will accept as a Topic Alias sent by the Server `number`,
    * `requestResponseInformation`: The Client uses this value to request the Server to return Response Information in the CONNACK `boolean`,
    * `requestProblemInformation`: The Client uses this value to indicate whether the Reason String or User Properties are sent in the case of failures `boolean`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`,
    * `authenticationMethod`: the name of the authentication method used for extended authentication `string`,
    * `authenticationData`: Binary Data containing authentication data `binary`
* `clean`: the 'clean start' flag. `boolean`
* `username`: username for protocol v3.1. `string`
* `password`: password for protocol v3.1. `string`

#### Connection#connack(options, [callback])
Send a MQTT connack packet.

`options` supports the following properties:

* `returnCode`: the return code of the connack, success is for MQTT < 5.0
* `reasonCode`: suback Reason Code `number` MQTT 5.0
* `properties`: properties MQTT 5.0.
`object` that supports the following properties:
    * `sessionExpiryInterval`: representing the Session Expiry Interval in seconds `number`,
    * `receiveMaximum`: representing the Receive Maximum value `number`,
    * `maximumQoS`: maximum qos supported by server `number`,
    * `retainAvailable`: declares whether the Server supports retained messages `boolean`,
    * `maximumPacketSize`: Maximum Packet Size the Server is willing to accept `number`,
    * `assignedClientIdentifier`: Assigned Client Identifier `string`,
    * `topicAliasMaximum`: representing the Topic Alias Maximum value indicates the highest value that the Client will accept as a Topic Alias sent by the Server `number`,
    * `reasonString`: representing the reason associated with this response `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`,
    * `wildcardSubscriptionAvailable`: this byte declares whether the Server supports Wildcard Subscriptions `boolean`
    * `subscriptionIdentifiersAvailable`: declares whether the Server supports Subscription Identifiers `boolean`,
    * `sharedSubscriptionAvailable`: declares whether the Server supports Shared Subscriptions `boolean`,
    * `serverKeepAlive`: Keep Alive time assigned by the Server `number`,
    * `responseInformation`: String which is used as the basis for creating a Response Topic `string`,
    * `serverReference`: String which can be used by the Client to identify another Server to use `string`,
    * `authenticationMethod`: the name of the authentication method used for extended authentication `string`,
    * `authenticationData`: Binary Data containing authentication data `binary`

#### Connection#publish(options, [callback])
Send a MQTT publish packet.

`options` supports the following properties:

* `topic`: the topic to publish to. `string`
* `payload`: the payload to publish, defaults to an empty buffer.
`string` or `buffer`
* `qos`: the quality of service level to publish on. `number`
* `messageId`: the message ID of the packet,
required if qos > 0. `number`
* `retain`: retain flag. `boolean`
* `properties`: `object`
    * `payloadFormatIndicator`: Payload is UTF-8 Encoded Character Data or not `boolean`,
    * `messageExpiryInterval`: the lifetime of the Application Message in seconds `number`,
    * `topicAlias`: value that is used to identify the Topic instead of using the Topic Name `number`,
    * `responseTopic`: String which is used as the Topic Name for a response message `string`,
    * `correlationData`: used by the sender of the Request Message to identify which request the Response Message is for when it is received `binary`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`,
    * `subscriptionIdentifier`: representing the identifier of the subscription `number`,
    * `contentType`: String describing the content of the Application Message `string`

#### Connection#puback #pubrec #pubcomp #unsuback(options, [callback])
Send a MQTT `[puback, pubrec, pubcomp, unsuback]` packet.

`options` supports the following properties:

* `messageId`: the ID of the packet
* `reasonCode`: Reason Code by packet `number`
* `properties`: `object`
    * `reasonString`: representing the reason associated with this response `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`

#### Connection#pubrel(options, [callback])
Send a MQTT pubrel packet.

`options` supports the following properties:

* `dup`: duplicate message flag
* `reasonCode`: pubrel Reason Code `number`
* `messageId`: the ID of the packet
* `properties`: `object`
    * `reasonString`: representing the reason associated with this response `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`

#### Connection#subscribe(options, [callback])
Send a MQTT subscribe packet.

`options` supports the following properties:

* `dup`: duplicate message flag
* `messageId`: the ID of the packet
* `properties`: `object`
    * `subscriptionIdentifier`:  representing the identifier of the subscription `number`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`
* `subscriptions`: a list of subscriptions of the form
`[{topic: a, qos: 0}, {topic: b, qos: 1}]`
`[{topic: a, qos: 0, nl: false, rap: true, rh: 15 }, {topic: b, qos: 1, nl: false, rap: false, rh: 100 }]` MQTT 5.0 Example

#### Connection#suback(options, [callback])
Send a MQTT suback packet.

`options` supports the following properties:

* `granted`: a vector of granted QoS levels,
of the form `[0, 1, 2]`
* `messageId`: the ID of the packet
* `reasonCode`: suback Reason Code `number`
* `properties`: `object`
    * `reasonString`: representing the reason associated with this response `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`

#### Connection#unsubscribe(options, [callback])
Send a MQTT unsubscribe packet.

`options` supports the following properties:

* `messageId`: the ID of the packet
* `reasonCode`: unsubscribe Reason Code MQTT 5.0 `number`
* `dup`: duplicate message flag
* `properties`: `object`
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`
* `unsubscriptions`: a list of topics to unsubscribe from,
of the form `["topic1", "topic2"]`

#### Connection#pingreq #pingresp #disconnect(options, [callback])
Send a MQTT `[pingreq, pingresp]` packet.

#### Connection#disconnect(options, [callback])
Send a MQTT `disconnect` packet.

`options` supports the following properties only MQTT 5.0:

* `reasonCode`: Disconnect Reason Code `number`
* `properties`: `object`
    * `sessionExpiryInterval`: representing the Session Expiry Interval in seconds `number`,
    * `reasonString`: representing the reason for the disconnect `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`,
    * `serverReference`: String which can be used by the Client to identify another Server to use `string`

#### Connection#auth(options, [callback])
Send a MQTT `auth` packet. Only MQTT 5.0

`options` supports the following properties only MQTT 5.0:

* `reasonCode`: Auth Reason Code `number`
* `properties`: `object`
    * `authenticationMethod`: the name of the authentication method used for extended authentication `string`,
    * `authenticationData`: Binary Data containing authentication data `binary`,
    * `reasonString`: representing the reason for the disconnect `string`,
    * `userProperties`: The User Property is allowed to appear multiple times to represent multiple name, value pairs `object`

#### Event: 'connect'
`function(packet) {}`

Emitted when a MQTT connect packet is received by the client.

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
  * `properties`: properties of will
* `properties`: properties of packet
* `clean`: clean start flag
* `username`: v3.1 username
* `password`: v3.1 password

#### Event: 'connack'
`function(packet) {}`

Emitted when a MQTT connack packet is received by the client.

`packet` is an object that may have the following properties:

* `returnCode`: the return code of the connack packet
* `properties`: properties of packet

#### Event: 'publish'
`function(packet) {}`

Emitted when a MQTT publish packet is received by the client.

`packet` is an object that may have the following properties:

* `topic`: the topic the message is published on
* `payload`: the payload of the message
* `messageId`: the ID of the packet
* `properties`: properties of packet
* `qos`: the QoS level to publish at

#### Events: \<'puback', 'pubrec', 'pubrel', 'pubcomp', 'unsuback'\>
`function(packet) {}`

Emitted when a MQTT `[puback, pubrec, pubrel, pubcomp, unsuback]`
packet is received by the client.

`packet` is an object that may contain the property:

* `messageId`: the ID of the packet
* `properties`: properties of packet

#### Event: 'subscribe'
`function(packet) {}`

Emitted when a MQTT subscribe packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `properties`: properties of packet
* `subscriptions`: an array of objects
representing the subscribed topics, containing the following keys
  * `topic`: the topic subscribed to
  * `qos`: the qos level of the subscription


#### Event: 'suback'
`function(packet) {}`

Emitted when a MQTT suback packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `properties`: properties of packet
* `granted`: a vector of granted QoS levels

#### Event: 'unsubscribe'
`function(packet) {}`

Emitted when a MQTT unsubscribe packet is received.

`packet` is an object that may contain the properties:

* `messageId`: the ID of the packet
* `properties`: properties of packet
* `unsubscriptions`: a list of topics the client is
unsubscribing from, of the form `[topic1, topic2, ...]`

#### Events: \<'pingreq', 'pingresp'\>
`function(packet){}`

Emitted when a MQTT `[pingreq, pingresp, disconnect]` packet is received.

`packet` only includes static header information and can be ignored.

#### Event: 'disconnect'
`function(packet) {}`

Emitted when a MQTT disconnect packet is received.

`packet` only includes static header information and can be ignored for MQTT < 5.0.

`packet` is an object that may contain the properties for MQTT 5.0:

* `reasonCode`: disconnect Reason Code
* `properties`: properties of packet

#### Event: 'auth'
`function(packet) {}`

Emitted when a MQTT auth packet is received.

`packet` is an object that may contain the properties:

* `reasonCode`: Auth Reason Code
* `properties`: properties of packet
-------------------------------------

<a name="generateStream">

### mqtt.generateStream()

Returns a `Transform` stream that calls [`generate()`](https://github.com/mqttjs/mqtt-packet#generate).
The stream is configured into object mode.

<a name="parseStream">

### mqtt.parseStream(opts)

Returns a `Transform` stream that embeds a [`Parser`](https://github.com/mqttjs/mqtt-packet#mqttparser) and calls [`Parser.parse()`](https://github.com/mqttjs/mqtt-packet#parserparsebuffer) for each new `Buffer`. The stream is configured into object mode. It accepts the same options of [`parser(opts)`](#parser).

<a name="contributing"></a>
Contributing
------------

mqtt-connection is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/mqttjs/mqtt-connection/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

mqtt-connection is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="http://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
<tr><th align="left">Adam Rudd</th><td><a href="https://github.com/adamvr">GitHub/adamvr</a></td><td><a href="http://twitter.com/adam_vr">Twitter/@adam_vr</a></td></tr>
<tr><th align="left">Siarhei Buntsevich</th><td><a href="https://github.com/scarry1992">GitHub/scarry1992</a></td></tr>
</tbody></table>

License
-------

MIT
