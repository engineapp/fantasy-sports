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

  this.key = null;
  this.days = null;
  this.gdata = null;


  this.gJax = function(options) {
    var defaults = {
      type: 'GET',
      data: {alt: 'json'},
      dataType: 'jsonp',
      context: this,
    };
    $.ajax($.extend(defaults, options));
  };


  this.setData = function(sheets) {
    console.log(sheets);
  }


  this.getSheet = function(sheets, n) {

    var cleanSheet = function(data) {
      cleaned = data.table.rows.map(function(row) {
        return row.c.map(function(c) { return c.v; });
      });
      return cleaned;
    };

    var gotSheet = function(data) {
      sheets[n].data = cleanSheet(data);
      n < sheets.length-1 ? this.getSheet(sheets, n+1) : this.setData(sheets);
    };

    _gquerystate.lock(gotSheet, this);
    this.gJax({
      url: sheets[n].href,
      jsonpCallback: _C.VIZ_CB,
    })
  };


  this.getSheetBase = function() {

    var processBase = function(data) {
      var sheets = data.feed.entry.map(function (sheet) {
        var link = sheet.link.filter(function(link) { return link.rel === _C.REL_VIZ; });
        return {team: sheet.title.$t,
                href: link[0].href}
      });
      this.getSheet(sheets, 0);
    };

    this.gJax({
      url: _C.SHEET_BASE.replace("<key>", this.key),
      jsonpCallback: 'sheetBase',
      success: processBase,
    });
  };


  //// Public methods

  this.load = function(key, callback) {
    this.key = key;
    this.getSheetBase(this.loadSheets);
  };

  this.setLimit = function(days, callback) {
    this.days = days;
    callback();
  }

  this.getData = function() {
    return [];
  }

  return this;
};
