var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;
let lockedPacks = {}

io.on('connection', function (socket) {
    let local_lockedPacks = []
    socket.on('disconnect', function() {
        console.log('Got disconnect!');
        if (socket.room && socket.room in lockedPacks) {
            lockedPacks[socket.room] = lockedPacks[socket.room].filter(e => !local_lockedPacks.includes(e));
            socket.broadcast.to(socket.room).emit("getState", lockedPacks[socket.room])
        }
     });

    socket.on('join-room', function (room) {
        if (socket.room) {
            console.log("IO: Room" + socket.room + " leaved")
            socket.leave(socket.room)
        }
        socket.room = room
        socket.join(room)
        console.log("IO: Room" + room + " joined")
        if (!(room in lockedPacks)){
            lockedPacks[room] = []
            console.log("Created")
        } else {
            socket.emit("getState", lockedPacks[room])
            console.log("Emitted")
        }
    })
    socket.on('packUnlocked', function (data) {
        if (lockedPacks[socket.room].includes(data.pack))
            lockedPacks[socket.room].splice(lockedPacks.indexOf(data.pack), 1)
        local_lockedPacks.splice(local_lockedPacks.indexOf(data.pack), 1)
        socket.broadcast.to(socket.room).emit("packUnlocked", data.pack)
    })
    socket.on('packLocked', function (data) {
        if (!lockedPacks[socket.room].includes(data.pack))
            lockedPacks[socket.room].push(data.pack)
        local_lockedPacks.push(data.pack)
        socket.broadcast.to(socket.room).emit("packLocked", data.pack)
    })
    socket.on('updateWriting', function (data) {
        socket.broadcast.to(socket.room).emit("updateWriting", {index: data.index, content: data.content})
    })
})

module.exports = socketApi;