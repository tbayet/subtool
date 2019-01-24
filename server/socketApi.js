var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function (socket) {

    socket.on('join-room', function (room) {
        if (socket.room) {
            console.log("IO: Room" + socket.room + " leaved")
            socket.leave(socket.room)
        }
        socket.room = room
        socket.join(room)
        console.log("IO: Room" + room + " joined")
    })
    
    socket.on('message', function (room) {
        console.log("Message sending to " + room)
        socket.broadcast.to(room).emit("try", "HELLO")
    })
})

module.exports = socketApi;