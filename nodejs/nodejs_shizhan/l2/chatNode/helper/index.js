/**
 * @build: 2014-09-10
 * @NAME : index
 */
exports.assignGuestName = require("./assignGuestName");//分配昵称
exports.joinRoom = require("./joinRoom");//进入房间
exports.handleNameChangeAttempts = require("./handleNameChangeAttempts");//更改昵称
exports.handleMessageBroadcasting = require("./handleMessageBroadcasting");//接收信息
exports.handleRoomJoining = require("./handleRoomJoining");//创建/进入房间
exports.handleClientDisconnection = require("./handleClientDisconnection");//用户离开房间
