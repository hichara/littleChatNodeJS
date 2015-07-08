
$(document).ready(function () {
	function addQuestion(auteur, text) {
		$('#qts_list').prepend('<li>' +
			'<h5>'+ auteur +' said :</h5>' +
			'<p class="text-center">'+ text +'</p>' +
			'</li>');
	}

	// initialisation socket io
	var socket = io.connect('http://localhost:8085');

	socket.on('question', function(message) {
		addQuestion(message.auteur, message.msg);
	});

	socket.on('updateChannels', function(channels){
		$('#lstChannel').children().remove();
		for(var i = 0; i < channels.length; i++) {
			$('#lstChannel').prepend('<li><a class="setChannel" href="#">' + channels[i] + '</a></li>');
		}
	});

	socket.on('messageFromServer', function(message) {

		var msg = '<div class="msgFrom col-lg-6 alert alert-info text-center">';
			msg += message;
			msg += '<button class="close">close</button></div>';

		$('#msgFromServer').prepend(msg);
	});

	$(document).on('click', '.close', function(){ 
		$(this).parent().fadeOut(400).remove(750);
	}); 

	$('#lstChannel > li').click(function(){
		$('#lstChannel li').removeClass("active");
		$(this).addClass("active");
	});


	// initialisation events

	$('#submitQ').click(function() {
		var text = $('#msg').val();
		socket.emit('question', text);
		$('#msg').val("");
	});


	$('#setNameBtn').click(function () {
		var name = '';
		name = $('#urPseudo').val();

		if(name != '') {
			socket.emit('setName', name);
			$('#myModal').modal('hide');
			socket.emit('setChannel', 'default');
		} else {
			alert('Name required');
		}
	});

	$('a#addChannel').click(function(){
		var name = prompt('set channel name :');
		if(name != '' && name != undefined) {
			socket.emit('setChannel', name);
			$('h3#chnName').html('Channel name : ' + name);
		}
	});

	$(document).on('click', 'a.setChannel', function(){ 
		var name = $(this).text();
		socket.emit('setChannel', name);
		$('h3#chnName').html('Channel name : ' + name);		
	});

	$('#myModal').modal('show');
});
