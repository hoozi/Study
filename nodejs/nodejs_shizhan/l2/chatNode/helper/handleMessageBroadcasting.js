/**
 * @build: 2014-09-11
 * @NAME : handleMessageBroadcasting
 */
module.exports = function(socket, nickNames) {
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
              text: nickNames[socket.id] + ': ' + message.text
        });
    });
}
