

var log = (function() {
  var alerter = function(message, level) {
    level = (level !== undefined ? level : 'info');
    console.log(level + ': ' + message)
  };
  return alerter;
})();


new (function(container) {

  var dataProvider = new GData(),
      charter      = new Chart($('.chart'));

  var sourceInput = $('#source', container),
      daysInput   = $('#days', container);


  this.draw = function() {
    log('drawing...');
    var data = dataProvider.getData();
    charter.update(data);
  };


  //// Mess with Data

  this.loadData = function(callback) {
    log('loading data...')
    var key = sourceInput.val();
    dataProvider.load(key, callback || this.draw);
  };

  this.filterData = function(callback) {
    log('filtering data...')
    var filter = daysInput.val();
    dataProvider.setLimit(filter, callback || this.draw);
  };


  //// Interactions
  sourceInput.on('change', this.loadData);
  daysInput.on('change', this.filterData)


  //// DOMLoaded
  $('html').removeClass('loading');
  log('site loaded.');
  this.loadData(this.filterData);

})($('#app'));
