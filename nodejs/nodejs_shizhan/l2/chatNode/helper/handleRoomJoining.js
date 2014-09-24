/**
 * @build: 2014-09-11
 * @NAME : handleRoomJoining
 */
var joinRoom = require("./joinRoom");
module.exports = function(socket, io, nickNames, currentRoom){
    socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom, io, nickNames, currentRoom);
    });
}
