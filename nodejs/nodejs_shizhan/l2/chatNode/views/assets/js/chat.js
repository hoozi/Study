/**
 * @build: 2014-09-11
 * @NAME : chat
 */

function Chat(socket) {
    this.socket = socket;
}

//发送聊天信息
Chat.prototype.sendMessage = function(room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
}

//变更房间
Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
  this.socket.emit('rooms');
};

//处理聊天命令
Chat.prototype.processCommand = function(command) {
  var words = command.split(' '); //例子：/join aaa---->["/join","aaa"]
  var command = words[0]
                .substring(1, words[0].length)
                .toLowerCase();//"/join"---->join
  var message = false;

  switch(command) {
    case 'join':
     
      //删除第一个元素，即/join
      words.shift();
      
      //获取room
      var room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nick':
    
      //删除第一个元素，即/nick
      words.shift();
      
      //获取name
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;
    default:
      message = '未知操作';
      break;
  };

  return message;
};