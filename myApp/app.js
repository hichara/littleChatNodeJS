var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.get('/file.js', function (req, res) {
	res.sendfile(__dirname + '/file.js');
});

app.get('/file.css', function (req, res) {
	res.sendfile(__dirname + '/file.css');
});


var channels = [];
var listChannel = [];
var counterChannels = [];

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

	console.log('user connecion');

	socket.on('setName', function(name) {
		socket.pseudo = name;
	
		socket.emit('messageFromServer', 'Welcome ' + name);
		console.log('new user : ' + name);

		socket.on('question', function(message) {
			var msg = {auteur : socket.pseudo, msg : message}
			var log = '' + socket.pseudo + ' : ';
			log = log + msg.msg;
			log += ' in ';
			log += socket.channel; 	
			log += ' of size ';
			log += channels[socket.channel].length;
			console.log(log);

			var tab = channels[socket.channel];
			for(s in tab) {
				tab[s].emit('question', msg);
			}
		});

		socket.on('getChannelList', function(){
			socket.emit('getChannelList', listChannel);
		});

		socket.on('setChannel', function(new_chn) {
			var index = listChannel.indexOf(new_chn);

			if(index < 0) {
				listChannel.push(new_chn);
				counterChannels[new_chn] = 0;
				channels[new_chn] = [];
			}

			socket.broadcast.emit('updateChannels', listChannel);
			socket.emit('updateChannels', listChannel);

			index = -1;

			if(socket.channel != undefined) {
				index = channels[socket.channel].indexOf(socket);
			}

			if(index > -1) {
				channels[socket.channel].splice(index, 1);
				counterChannels[socket.channel] = counterChannels[socket.channel] - 1;

				if(counterChannels[socket.channel] == 0) {
					delete counterChannels[socket.channel];
					listChannel.splice(index, 1);
				}
			}

			socket.channel = new_chn;
			channels[socket.channel].push(socket);
			counterChannels[socket.channel] = counterChannels[socket.channel] + 1;
			socket.emit('messageFromServer', 'Current channel : ' + new_chn);
			console.log(socket.pseudo + ' set channel on : '+ new_chn);
		});
	});
});



server.listen(8085);