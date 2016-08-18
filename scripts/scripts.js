
var boardID = '5767fa41ed4b0326883e368b';
var resp = null;
var minTime = new Date("2016-08-10T00:00:00.000Z");

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

  google.charts.load('current', {'packages':['corechart']});
  getBoards();
};

function getBoards() {
  resp = Trello.get('/members/me/boards', boardLoad, error);
}
var boardLoad = function() {
  var response = JSON.parse(resp.responseText);
  insertTemplate('boards', '__board-container', response);
};
function boardChange(elem) {
  boardID = elem.value;
  getMembers();
}


function getMembers() {
  resp = Trello.get('/boards/' + boardID + '/members', memberLoad, error);
}
var memberLoad = function() {
  var response = JSON.parse(resp.responseText);
  insertTemplate('users', '__user-container', response);
};
function memberChange(elem) {
  var name = elem.options[elem.selectedIndex].dataset.username;
  getActivities(elem.value, name);
}


function getActivities(id, name) {
  resp = Trello.get('/members/' + id + '/actions?limit=500', activityLoad, error);

  //  Insert template for chart area
  insertTemplate('charts', '__chart-container', {name: name});
}
var activityLoad = function() {
  var json = JSON.parse(resp.responseText);
  var dictionary = {};

  // Filter Data
  json = _.filter(json, function(o) {
    if(o.data.board.id == boardID) {
      var d = new Date(o.date);
      if (d > minTime) {
        if(dictionary[o.type] == undefined) {
          dictionary[o.type] = 1;
        }
        else {
          dictionary[o.type]++;
        }
        return o;
      }
    }
  });

  // Draw Chart
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Label');
  data.addColumn('number', 'Amount');
  for(var p in dictionary) {
    data.addRows([
       [p, dictionary[p]]
    ]);
  }
  data.sort('Label');

  var options = {
    titlePosition:'none',
    legend:'none',
    width:'100%',
    height:400};

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.ColumnChart(document.getElementById('action-chart'));
  chart.draw(data, options);

  console.log(json);
  console.log(dictionary);
};







// HELPER METHODS

function insertTemplate(templateName, containerName, data) {
  var source   = $('#' + templateName).html();
  var template = Handlebars.compile(source);
  var temp = $('#' + containerName);
  temp[0].innerHTML = template(data);
}

