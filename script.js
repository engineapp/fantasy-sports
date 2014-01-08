

var log = (function(place) {
  var alerter = function(message, level) {
    if (typeof level === "undefined") level = 'info';
    console.log(level + ': ' + message)
    if (level !== 'debug') {
      place.text(message);
      setTimeout(function() { place.text(''); }, 1618);
    }
  };
  return alerter;
})($('.notifications'));


new (function(container) {

  var self = this;

  var dataProvider = new GData(),
      charter      = new Chart($('.chart', container)[0]);

  var sourceInput   = $('#source', container),
      refreshButton = $('#refresh-source', container),
      daysInput     = $('#days', container);


  self.draw = function() {
    log('drawing...', 'debug');
    var sheetData = dataProvider.getData();
    var scores = sheetData.map(function(sheet) {
      var gps = sheet.data.reduce(function(prev, d) { return prev + d[1] }, 0.0);
      var points = sheet.data.reduce(function(prev, d) { return prev + d[2] }, 0.0);
      var average = points / gps;
      if (average !== average) {  //NaN
        average = 'Can\'t Computer :(';
      }
      return {
        team: sheet.team,
        average: average,
      }     
    });
    scores.sort(function(a, b) {
      if (typeof a.average !== 'number' || typeof b.average !== 'number') {
        if (typeof a.average === 'number') return -1;
        if (typeof b.average === 'number') return 1;
        return 0;
      }
      return a.average > b.average ? -1 : a.average < b.average ? 1 : 0;
    });
    charter.update(scores);

    if (scores.length === 0) {
      log('No data for this date range :(');
    }

  };


  //// Mess with Data

  self.loadData = function(callback) {
    log('loading data...');
    var key = sourceInput.val();
    if (typeof callback !== "function") callback = self.draw;
    dataProvider.load(key, callback);
  };

  self.filterData = function(callback) {
    log('filtering data...', 'debug');
    var filter = daysInput.val();
    if (typeof callback !== "function") callback = self.draw;
    dataProvider.setLimit(filter, callback);
  };


  //// Interactions
  sourceInput.on('change', self.loadData);
  refreshButton.on('click', function(e) { self.loadData(); return false; });
  daysInput.on('change keyup', self.filterData)
  $(window).on('resize', function() {
    charter.sizeUp();
    self.draw();
  });


  //// DOMLoaded
  $('html').removeClass('loading');
  self.loadData(self.filterData);

})($('#app'));
