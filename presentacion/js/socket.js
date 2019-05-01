// eslint-disable-next-line no-undef
var socket = io.connect(null, { 'forceNew': true });
socket.on('messages', function (data) {
    console.log(data);
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