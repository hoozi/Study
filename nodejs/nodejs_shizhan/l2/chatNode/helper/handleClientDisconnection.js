/**
 * @build: 2014-09-11
 * @NAME : handleClientDisconnection
 */
module.exports = function(socket,  nickNames, namesUsed){
    socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        
        //删除名字
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}
