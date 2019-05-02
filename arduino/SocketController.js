var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 8081;

app.use(express.static('presentacion'))

app.get('/', function (req, res) {
  res.status(200).send('servidor');
});

io.on('connection', function (socket) {
  console.log("se conecto un cliente con IP:", socket.handshake.address);


  socket.on('new-message', function (data) {
    console.log("aaa", data);
    io.emit('messages', "Ldown");

  });

});

server.listen(port, function () {
  console.log("Listen in port: ", port);
});

module.exports = {
  getIo: function () {
      console.log("inicio");
      return io;
  }
}

/*
  ==============================================================
  --BORRRAR LLAMADO A ARDUINO PARA PROBAR SOLO LA PRESENTACION--
  ==============================================================

*/
// eslint-disable-next-line no-unused-vars
var arduino = require('./ArduinoController');
arduino.iniciar();
