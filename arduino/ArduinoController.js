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
        board, buttonL, buttonR;
    var SocketController = io.getIo();

    board = new five.Board();

    board.on("ready", function () {

        // Create a new `button` hardware instance.
        // This example allows the button module to
        // create a completely default instance
        buttonL = new five.Button(2);
        buttonR = new five.Button(4);

        // Inject the `button` hardware into
        // the Repl instance's context;
        // allows direct command line access
        board.repl.inject({
            button: buttonL
        });
        board.repl.inject({
            button: buttonR
        });

        // Button Event API

        // "down" the button is pressed
        buttonL.on("down", function () {
            console.log("Ldown");
            SocketController.emit('messages', "Ldown");
        });

        // "hold" the button is pressed for specified time.
        //        defaults to 500ms (1/2 second)
        //        set
        buttonL.on("hold", function () {
            console.log("Lhold");
            SocketController.emit('messages', "Lhold");
        });

        // "up" the button is released
        buttonL.on("up", function () {
            console.log("Lup");
            SocketController.emit('messages', "Lup");
        });

        // "down" the button is pressed
        buttonR.on("down", function () {
            console.log("Rdown");
            SocketController.emit('messages', "Rdown");
        });

        // "hold" the button is pressed for specified time.
        //        defaults to 500ms (1/2 second)
        //        set
        buttonR.on("hold", function () {
            console.log("Rhold");
            SocketController.emit('messages', "Rhold");
        });

        // "up" the button is released
        buttonR.on("up", function () {
            console.log("Rup");
            SocketController.emit('messages', "Rup");
        });
    });

}
