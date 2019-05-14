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
    console.log("Esto es data de author" + data.author);
    if (data.author == "a") {
      io.emit('Left', "up");
    } else if (data.author == "d") {
      io.emit('Right', "up");
    } else if (data.author == "q") {
      io.emit('Left', "down");
    } else if (data.author == "e") {
      io.emit('Right', "down");
    } else if(data.author =="z"){
      io.emit('Start', "");
    }else if(data.author == "x"){
      io.emit('Disparo', 100);
    }
    else {
      io.emit('messages', "Otra cosa");
    }


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
