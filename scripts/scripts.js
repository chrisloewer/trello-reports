
var boardID = '5767fa41ed4b0326883e368b';
var resp = null;
var minTime = new Date("2016-08-15T21:53:42.381Z");


var authenticationSuccess = function() { console.log('Successful authentication'); };
var authenticationFailure = function() { console.log('Failed authentication'); };
var error = function() { console.log('error'); };
var success = function() {console.log(JSON.parse(resp.responseText))};

window.onload = function() {
  Trello.authorize({
    name: 'Getting Started Application',
    scope: {
      read: true,
      write: true },
    success: authenticationSuccess,
    error: authenticationFailure
  });
};


function getMembers() {
  resp = Trello.get('/boards/' + boardID + '/members', memberLoad, error);
}
var memberLoad = function() {
  var response = JSON.parse(resp.responseText);
  insertTemplate('users', '__user-container', response);

  //  _.filter(data, function(o) { return o.fullName=='Ben'; });
};


function getActivities(username) {
  var load = function() { activityLoad(username) };
  resp = Trello.get('/boards/' + boardID + '/actions?limit=1000', load, error);
}
var activityLoad = function(arg) {
  var json = JSON.parse(resp.responseText);

  var temp = _.filter(json, function(o) {
    if(o.idMemberCreator == arg) {
      var d = new Date(o.date);
      if (d > minTime)
        return o;
    }
  });

  console.log(temp);
};





// STATUS RESPONSES



// HELPER METHODS

function insertTemplate(templateName, containerName, data) {
  var source   = $('#' + templateName).html();
  var template = Handlebars.compile(source);
  var temp = $('#' + containerName);
  temp[0].innerHTML = template(data);
}

