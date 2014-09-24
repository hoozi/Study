/**
 * @build: 2014-09-11
 * @NAME : chat-ui
 */

//message DOM
function divEscapedContentElement(message,dir) {
  return dir?$('<li class="l"></li>').text(message):$('<li class="r"></li>').text(message);
}

//命令
function divSystemContentElement(message) {
  return $('<li class="sys"></li>').html(message);
}


function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages ul').append(divSystemContentElement(systemMessage));
     
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages ul').append(divEscapedContentElement("你："+message, true));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

var socket = io.connect();
var chatApp = new Chat(socket);

//更名
socket.on('nameResult', function(result) {
    var message;
    
    if (result.success) {
      message = '系统：你的昵称为' + result.name + '';
    } else {
      message = result.message;
    }
    $('#messages ul').append(divSystemContentElement(message));
});

//进入房间
socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages ul').append(divSystemContentElement('系统：欢迎进入'+result.room));
});

//下线
socket.on('leaveRoom', function(result) {
    $('#messages ul').append(divSystemContentElement(result.text));
});

//接收消息
socket.on('message', function (message) {
    var newElement;
    if(message.stats) {
        newElement = $('<li class="sys"></li>').text(message.text);
    } else {
        newElement = $('<li class="r"></li>').text(message.text);
    }
    
    $('#messages ul').append(newElement);
});

//房间列表
socket.on('rooms', function(rooms) {
    $('#room-list ul').empty();

    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list ul').append(divEscapedContentElement(room));
      }
    }

    $('#room-list li').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
});
socket.emit('rooms');
$("#up-room").click(function(){
    socket.emit('rooms');
})

$('#send-message').focus();

$('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
});
$(document).on("keypress", function(e){
    if(e.which==13){
        processUserInput(chatApp, socket);
        return false;
    }
})
