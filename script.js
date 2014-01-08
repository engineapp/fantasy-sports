

var log = (function() {
  var alerter = function(message, level) {
    level = (level !== undefined ? level : 'info');
    console.log(level + ': ' + message)
  };
  return alerter;
})();


new (function(container) {

  var self = this;

  var dataProvider = new GData(),
      charter      = new Chart($('.chart', container)[0]);

  var sourceInput = $('#source', container),
      daysInput   = $('#days', container);


  this.draw = function() {
    log('drawing...');
    var sheetData = dataProvider.getData();
    var scores = sheetData.map(function(sheet) {
      var gps = sheet.data.reduce(function(prev, d) { return prev + d[1] }, 0.0);
      var points = sheet.data.reduce(function(prev, d) { return prev + d[2] }, 0.0);
      var average = points / gps;
      return {
        team: sheet.team,
        average: average,
      }     
    });
    charter.update(scores);
  };


  //// Mess with Data

  this.loadData = function(callback) {
    log('loading data...');
    var key = sourceInput.val();
    if (typeof callback !== "function") callback = self.draw;
    dataProvider.load(key, callback);
  };

  this.filterData = function(callback) {
    log('filtering data...');
    var filter = daysInput.val();
    if (typeof callback !== "function") callback = self.draw;
    dataProvider.setLimit(filter, callback);
  };


  //// Interactions
  sourceInput.on('change', this.loadData);
  daysInput.on('change', this.filterData)


  //// DOMLoaded
  $('html').removeClass('loading');
  log('site loaded.');
  this.loadData(this.filterData);

})($('#app'));
