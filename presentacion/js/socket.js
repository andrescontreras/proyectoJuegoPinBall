// eslint-disable-next-line no-undef
var socket = io.connect(null, { 'forceNew': true });
socket.on('Left', function (data) {
    console.log(data);
    actualizarPalancaIzquierda(data);
    render(data);
});
socket.on('Right', function (data) {
    console.log(data);
    actualizarPalancaDerecha(data);
    render(data);
});
socket.on('Start', function (data) {
    console.log(data);
    empujarResorte();
    render(data);
});
socket.on('Disparo', function (data) {
    console.log(data);
    dispararPelota(data);
    render(data);
});
socket.on('tension', function (data) {
    console.log(data);
    tensionResorte(data);
    render(data);
});
function render(data) {
    var list = document.getElementById('messages');
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(data));
    list.appendChild(entry);
}

// eslint-disable-next-line no-unused-vars
function addMessage() {
    var o = {
        author: document.getElementById('username').value,
        text: document.getElementById('texto').value
    }
    socket.emit('new-message', o);
    return false;
}