var _C = {
  SHEET_BASE: "https://spreadsheets.google.com/feeds/worksheets/<key>/public/basic",
  REL_VIZ:    "http://schemas.google.com/visualization/2008#visualizationApi",
  VIZ_CB:     "google.visualization.Query.setResponse",
}


// hack google's visualization api because google keeps the nice data for itself (meanies)
// the jsonp callback will be `google.visualization.Query.setResponse
var _gquerystate = {
  locked: false,
  callback: null,
  context: window,
  lock: function(callback, context) {
    _gquerystate.locked = true,
    $.extend(_gquerystate, {
      callback: callback || function() {},
      context: context || window,
    });
  },
  respond: function(data) {
    _gquerystate.callback.call(_gquerystate.context, data);
    _gquerystate.locked = false;
  }
}

var google = {
  visualization: {
    Query: {
      setResponse: function(data) {
        _gquerystate.respond(data)
      }
    }
  }
}



var GData = function() {

  var self = this;

  self.key = null;
  self.days = null;
  self.dateLimit = null;
  self.gdata = null;


  self.gJax = function(options) {
    var defaults = {
      type: 'GET',
      data: {alt: 'json'},
      dataType: 'jsonp',
      context: self,
    };
    $.ajax($.extend(defaults, options));
  };


  self.setData = function(sheets, callback) {
    self.gdata = sheets;
    if (typeof callback === 'function') callback();
  }


  self.getSheet = function(sheets, n, callback) {

    var cleanSheet = function(data) {
      cleaned = data.table.rows.map(function(row) {
        return row.c.map(function(c) { return c.v; });
      });
      return cleaned;
    };

    var gotSheet = function(data) {
      sheets[n].data = cleanSheet(data);
      n < sheets.length-1
        ? self.getSheet(sheets, n+1, callback)
        : self.setData(sheets, callback);
    };

    _gquerystate.lock(gotSheet, self);
    self.gJax({
      url: sheets[n].href,
      jsonpCallback: _C.VIZ_CB,
    })
  };


  self.getSheetBase = function(callback) {

    var processBase = function(data) {
      var sheets = data.feed.entry.map(function (sheet) {
        var link = sheet.link.filter(function(link) { return link.rel === _C.REL_VIZ; });
        return {team: sheet.title.$t,
                href: link[0].href}
      });
      self.getSheet(sheets, 0, callback);
    };

    self.gJax({
      url: _C.SHEET_BASE.replace("<key>", self.key),
      jsonpCallback: 'sheetBase',
      success: processBase,
    });
  };


  self.limitDays = function(data) {
    return data[0] > self.dateLimit;
  };


  //// Public methods

  self.load = function(key, callback) {
    self.key = key;
    self.getSheetBase(callback || function() {});
  };

  self.setLimit = function(days, callback) {
    self.days = parseInt(days);
    self.dateLimit = new Date((new Date()).getTime() - (1000*60*60*24*self.days));
    if (typeof callback === 'function') callback();
  }

  self.getData = function() {
    return self.gdata.map(function(teamData) {
      var data = teamData.data.filter(self.limitDays)
      return $.extend({}, teamData, {data: data});
    });
  }

  return self;
};
