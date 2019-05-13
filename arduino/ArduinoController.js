// eslint-disable-next-line no-unused-vars
module.exports = {
    iniciar: function () {
        console.log("inicio");
        iniciar();
    }
}

// eslint-disable-next-line no-unused-vars
function iniciar() {
    var io = require('./SocketController');
    var five = require("johnny-five"),
        board, buttonL, buttonR, buttonStart, sensor;
    var SocketController = io.getIo();

    board = new five.Board();

    board.on("ready", function () {

        // Create a new `button` hardware instance.
        // This example allows the button module to
        // create a completely default instance
        buttonL = new five.Button(2);
        buttonR = new five.Button(4);
        buttonStart = new five.Button(6);
        sensor = new five.Sensor("A0");


        // Inject the `button` hardware into
        // the Repl instance's context;
        // allows direct command line access
        board.repl.inject({
            button: buttonL
        });
        board.repl.inject({
            button: buttonR
        });
        board.repl.inject({
            button: buttonStart
        });

        // Button Event API

        // "down" the button is pressed
        buttonL.on("down", function () {
            console.log("Ldown");
            SocketController.emit('Left', "down");
        });


        // "up" the button is released
        buttonL.on("up", function () {
            console.log("Lup");
            SocketController.emit('Left', "up");
        });

        // "down" the button is pressed
        buttonR.on("down", function () {
            console.log("Rdown");
            SocketController.emit('Right', "down");
        });

        // "up" the button is released
        buttonR.on("up", function () {
            console.log("Rup");
            SocketController.emit('Right', "up");
        });


        // "down" the button is pressed
        buttonStart.on("down", function () {
            console.log("Startdown");
            SocketController.emit('Start', "down");
        });

        var anteriorPot = 0; 
        var disp = false;


        // Scale the sensor's data from 0-1023  log changes
        sensor.on("change", function () {
            var ant = this.scaleTo(0, 1023)-2;
            var des = this.scaleTo(0, 1023)+2;
            
            if (anteriorPot<ant||anteriorPot>des) {
                if (anteriorPot>des+1&&disp==false) {
                    console.log(this.scaleTo(0, 1023));
                    SocketController.emit('Disparo',this.scaleTo(0, 1023) );
                    disp=true;  
                }if (anteriorPot<des) {
                    disp=false;
                }
                anteriorPot=this.scaleTo(0, 1023);
            }
        });
    });

    // aaaaas

}

