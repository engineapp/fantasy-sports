
var Chart = function(canvas) {

  var chart = d3.select(canvas);

  this.update = function(data) {
    var rows = chart.selectAll('div').data(data);
    
    var row = rows.enter().append('div')
    row.append('span').attr('class', 'team');
    row.append('span').attr('class', 'average');

    rows.select('.team').text(function(d) { return d.team; });
    rows.select('.average').text(function(d) { return d.average; });

    rows.exit().remove();
  };

  return this;
};