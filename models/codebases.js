'use strict';
/* globals Promise */

var config = require('../config');
var debug = require('debug')('model:codebases');
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

      db.view('codebases', 'public', function(err, body) {
        if (err) {
          debug('err', err.statusCode, JSON.stringify(err));
          return reject(err);
        }

        self._list = body;

        resolve(body);
      });
    });
  }
};

exports.CodeBases = CodeBases;
