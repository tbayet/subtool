var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;
let packs = {}
let updates = {}

// Change room by (id_project)
io.on('connection', function (socket) {
    let local_lockedPacks = []
    socket.on('disconnect', function() {
        console.log('Got disconnect!');
        if (socket.room && socket.room in packs) {
            packs[socket.room].locked = packs[socket.room].locked.filter(e => !local_lockedPacks.includes(e))
            local_lockedPacks = []
            socket.broadcast.to(socket.room).emit("getState", {packs: packs[socket.room]})
        }
     });

    socket.on('join-room', function (room) {
        if (socket.room) {
            console.log("IO: Room" + socket.room + " leaved")
            socket.leave(socket.room)
        }
        socket.room = room
        socket.join(room)
        console.log("IO: Room" + room + " joined by " + socket.id)
        if (!(room in packs)){
            packs[room] = {locked: [], valid: [], confirmed: []}
            updates[room] = {}
            console.log("Created")
        } else {
            socket.emit("getState", { packs: packs[room], updates: updates[room]})
            console.log("Emitted")
        }
    })
    socket.on("saved", function () {
        updates[socket.room] = {}
    })
    socket.on("addRule", function () {
        io.to(socket.room).emit("addRule")
    })
    socket.on("setConfirmedPack", function (data) {
        if (!packs[socket.room].confirmed.includes(data.index)) {
            packs[socket.room].confirmed.push(data.index)
            if (packs[socket.room].locked.includes(data.index)) {
                packs[socket.room].locked.splice(packs[socket.room].locked.indexOf(data.index), 1)
                if (local_lockedPacks.includes(data.index))
                    local_lockedPacks.splice(local_lockedPacks.indexOf(data.index), 1)
                io.to(socket.room).emit("packUnlocked", packs[socket.room].loked)
            }
            io.to(socket.room).emit("confirmedPack", packs[socket.room].confirmed)
        } else if (packs[socket.room].confirmed.includes(data.index)) {
            packs[socket.room].confirmed.splice(packs[socket.room].confirmed.indexOf(data.index), 1)
            io.to(socket.room).emit("confirmedPack", packs[socket.room].confirmed)
        }
    })
    socket.on("setValidPack", function (data) {
        if (data.isValid && !packs[socket.room].valid.includes(data.index)) {
            packs[socket.room].valid.push(data.index)
            io.to(socket.room).emit("validPack", packs[socket.room].valid)
        } else if (!data.isValid && packs[socket.room].valid.includes(data.index)) {
            packs[socket.room].valid.splice(packs[socket.room].valid.indexOf(data.index), 1)
            io.to(socket.room).emit("validPack", packs[socket.room].valid)
        }
    })
    socket.on('packUnlocked', function (data) {
        if (packs[socket.room].locked.includes(data.pack))
            packs[socket.room].locked.splice(packs[socket.room].locked.indexOf(data.pack), 1)
        if (local_lockedPacks.includes(data.pack))
            local_lockedPacks.splice(local_lockedPacks.indexOf(data.pack), 1)
        socket.broadcast.to(socket.room).emit("packUnlocked", data.pack)
    })
    socket.on('packLocked', function (data) {
        if (!packs[socket.room].locked.includes(data.pack))
            packs[socket.room].locked.push(data.pack)
        if (!local_lockedPacks.includes(data.pack))
            local_lockedPacks.push(data.pack)
        socket.broadcast.to(socket.room).emit("packLocked", data.pack)
    })
    socket.on('updateWriting', function (data) {
        socket.broadcast.to(socket.room).emit("updateWriting", {index: data.index, content: data.content})
    })
    // data: {index, content}
    socket.on('updateJson', function(data) {
        updates[socket.room][data.index] = data.content
        socket.broadcast.to(socket.room).emit("updateWriting", {index: data.index, content: data.content})
    })
    socket.on('newMessage', function(message) {
        io.to(socket.room).emit("newMessage", {author: socket.id, content: message})
    })
})

module.exports = socketApi;