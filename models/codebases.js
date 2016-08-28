'use strict';
/* globals Promise */

var config = require('../config');
var debug = require('debug')('model:codebase');
var nano = require('nano')(config.db.url);

var db = nano.db.use(config.db.database);

var CodeBases = {

  _list: null,
  _listExpires: Date.now(),
  _listTTL: 10 * 1000,

  list: function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      if (self._list && self._listExpires > Date.now()) {
        return resolve(self._list);
      }

      debug('fetching the list', self._listExpires, Date.now());
      resolve([]);
    });
  }
};

exports.CodeBases = CodeBases;
