
var boardID = '5767fa41ed4b0326883e368b';
var resp = null;


function testAuthorization() {
	console.log('testAuthorization()');
	Trello.authorize({
		name: 'Getting Started Application',
		scope: {
			read: true,
			write: true },
		success: authenticationSuccess,
		error: authenticationFailure
	});
}

function doStuff() {
	Trello.authorize({
		name: 'Getting Started Application',
		scope: {
			read: true,
			write: true },
		success: authenticationSuccess,
		error: authenticationFailure
	});

	resp = Trello.get('/boards/' + boardID + '/actions?limit=100&filter=createCard'	, success, error);
}


function loadMembers() {
	Trello.authorize({
		name: 'Getting Started Application',
		scope: {
			read: true,
			write: true },
		success: authenticationSuccess,
		error: authenticationFailure
	});

	resp = Trello.get('/boards/' + boardID + '/members', success, error);
}





// STATUS RESPONSES

var authenticationSuccess = function() {
	console.log('Successful authentication');
};

var authenticationFailure = function() {
	console.log('Failed authentication');
};

var success = function() {
	// console.log('Success');

	var response = JSON.parse(resp.responseText);
	console.log(response);
};

var error = function() {
	console.log('error');
};
