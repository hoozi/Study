/**
 * @build: 2014-09-09
 * @NAME : app
 */
var http = require("http")
   ,config = require("./config")
   ,serverStatic = require("./controllers/serverStatic");

var server = http.createServer();
server.on("request",function(request, response) {
	var filePath = null;
	if(request.url=="/") {
		filePath = "views/index.html";
	} else {
		filePath = "views"+request.url;
	}
	var absPath = "./"+filePath;
	serverStatic(response, absPath);
}).listen(config.port, config.host, function() {
	console.log("运行在"+config.host+":"+config.port)
});
var chatServer = require('./controllers/chatServer');
chatServer.listen(server);