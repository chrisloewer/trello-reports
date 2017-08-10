// Pull recent activity from Trello api to track progress

var boardID = '';
var resp = null;
var authenticationSuccess = function() { console.log('Successful authentication'); };
var authenticationFailure = function() { console.log('Failed authentication'); };
var error = function() { console.log('error'); };
var success = function() {console.log(JSON.parse(resp.responseText))};


// Initialize Page
window.onload = function() {
  Trello.authorize({
    name: 'Trello Analytics',
    scope: {
      read: true,
      write: true },
    success: authenticationSuccess,
    error: authenticationFailure
  });

  google.charts.load('current', {'packages':['corechart', 'table']});
  getBoards();

  var today = new Date;
  var todayString = today.getUTCFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate())).slice(-2);
  document.getElementById('start-date-picker').value = todayString;
};

function setStartDate() {
  // var elem = document.getElementById('start-date-picker');
  var memberPicker = document.getElementById('member-picker');
  //
  // startTime = new Date(elem.value);

  if(memberPicker.options[memberPicker.selectedIndex].dataset.username) {
    getActivities();
  }
}


// Populate Page from API
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


function getActivities() {
  var elem = document.getElementById('member-picker');
  var name = elem.options[elem.selectedIndex].dataset.username;
  var id = elem.value;

  if(id == -1) {
    // No user selected, show entire board results
    resp = Trello.get('/boards/' + boardID + '/actions?limit=1000', activityLoad, error);
  }
  else {
    // Only show user selected
    resp = Trello.get('/members/' + id + '/actions?limit=1000', activityLoad, error);
  }
  insertTemplate('charts', '__chart-container', {name: name});
}

var activityLoad = function() {
  var json = JSON.parse(resp.responseText);
  var categoryCount = {};
  var timeArr = [['Time', 'Category']];
  var timeArrLegend = {};
  var catIndex = 0;
  var boardFilter = document.getElementById('board-filter-checkbox');

  // Filter Data
  json = _.filter(json, function(o) {

    var elem = document.getElementById('start-date-picker');
    var startTime = new Date(elem.value);

    if(boardFilter.checked && o.data.board.id != boardID) {
      return;
    }

    var d = new Date(o.date);

    if (d > startTime) {
      if(categoryCount[o.type] == undefined) {
        categoryCount[o.type] = 1;
      }
      else {
        categoryCount[o.type]++;
      }

      if (timeArrLegend[o.type] == undefined) {
        timeArrLegend[o.type] = catIndex;
        catIndex++;
      }
      timeArr.push([d.getTime(), timeArrLegend[o.type]]);

      return o;
    }

  });

  // Prepare Data
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Label');
  data.addColumn('number', 'Amount');
  for(var p in categoryCount) {
    data.addRows([
       [p, categoryCount[p]]
    ]);
  }
  data.sort('Label');

  var categoryLegend = new google.visualization.DataTable();
  categoryLegend.addColumn('number', 'Action');
  categoryLegend.addColumn('string', 'Type');
  for(var p in timeArrLegend) {
    categoryLegend.addRows([
      [timeArrLegend[p], p]
    ]);
  }

  var timeData = google.visualization.arrayToDataTable(timeArr);
  var options = {
    titlePosition:'none',
    legend:'none',
    width:'100%',
    height:400};
  var timeOptions = {
    hAxis: {title: 'Time', textPosition: 'none'},
    vAxis: {title: 'Category'},
    height: 500,
    legend: 'none',
    pointSize: 4,
    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }
  };

  // Instantiate and draw charts
  var chart = new google.visualization.ColumnChart(document.getElementById('action-chart'));
  var table = new google.visualization.Table(document.getElementById('action-table'));
  chart.draw(data, options);
  table.draw(data, {});

  var timeChart = new google.visualization.ScatterChart(document.getElementById('timespread-chart'));
  var timeTable = new google.visualization.Table(document.getElementById('timespread-table'));
  timeChart.draw(timeData, timeOptions);
  timeTable.draw(categoryLegend, {});

  // console.log(json);
};


// HELPER METHODS
function insertTemplate(templateName, containerName, data) {
  var source   = $('#' + templateName).html();
  var template = Handlebars.compile(source);
  var temp = $('#' + containerName);
  temp[0].innerHTML = template(data);
}

