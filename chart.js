
var Chart = function(canvas) {

  /// init
  var self = this;
  self.chart = d3.select(canvas);

  //// style settings
  self.labelWidth = 100;


  //// private
  self.xmax = 0;
  self.chartmax = 0;


  self.sizeUp = function() {
    self.chartmax = ($(canvas).width() - self.labelWidth) * .99;
  };

  // self.cmp = function(a, b) {
  //   if (typeof a.average !== 'number' || typeof b.average !== 'number') {
  //     if (typeof a.average === 'number') return -1;
  //     if (typeof b.average === 'number') return 1;
  //     return 0;
  //   }
  //   return a.average > b.average ? -1 : a.average < b.average ? 1 : 0;
  // };

  self.setWidth = function(selection) {
    selection.style("width", function(d) {
      var w = self.chartmax * d.average / self.xmax;
      return w + "px";
    });
  };

  self.update = function(data) {

    self.xmax = d3.max(data.map(function(d) { return d.average; }));

    var rows = self.chart.selectAll('div').data(data) ;//.sort(self.cmp);
    self.setWidth(rows.select('span.average'));
    
    var newRows = rows.enter().append('div'); //.sort(self.cmp);

    newRows.append('span').attr('class', 'team').style('width', self.labelWidth + 'px');

    var avg = newRows.append('span').attr('class', 'average');
    self.setWidth(avg);

    rows.select('.team').text(function(d) { return d.team; });
    rows.select('.average').text(function(d) {
      if (typeof d.average === 'number') {
        return d.average.toFixed(2);
      } else {
        return d.average;
      }
    });

    rows.exit().remove();
  };


  //// init
  self.sizeUp();


  return self;
};
