var Corpus = require('ilanguage/js/corpus/Corpus').Corpus;
var config = require('../config');
var nano = require('nano')(config.db.url);

var db = nano.db.use(config.db.database);

var CodeBase = function CodeBase(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = 'CodeBase';
  }
  this.debug('body', 'In CodeBase ', options);
  Corpus.apply(this, arguments);
};

CodeBase.prototype = Object.create(Corpus.prototype, /** @lends CodeBase.prototype */ {
  constructor: {
    value: CodeBase
  },

  identifier: {
    get: function() {
      return this.id;
    },
    set: function(value) {
      this.id = value;
    }
  },

  save: {
    value: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        var json = self.toJSON();
        json._id = self.id;

        if (self.rev) {
          json._rev = self.rev;
        } else {
          json.dateCreated = Date.now();
        }
        json.dateModified = Date.now();

        self.debug('saving', json);
        db.insert(json, function(err, body) {
          if (err) {
            self.warn('err', err.statusCode, JSON.stringify(err));
            return reject(err);
          }
          if (!body || !body.ok) {
            self.debug('body', body);
            return reject(body);
          }
          if (body.rev) {
            self.rev = body.rev;
          }
          if (body.id) {
            self.id = body.id;
          }
          resolve(self);
        });
      });
    }
  },

  fetch: {
    value: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        db.get(self.id, function(err, body) {
          if (err) {
            self.warn('err', err.statusCode, JSON.stringify(err));
            return reject(err);
          }

          self.merge('self', body);
          resolve(self);
        });
      });
    }
  },

  delete: {
    value: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        db.destroy(self.id, self.rev, function(err, body) {
          if (err) {
            self.warn('err', err.statusCode, JSON.stringify(err));
            return reject(err);
          }

          resolve(body);
        });
      });
    }
  }
});

exports.CodeBase = CodeBase;
