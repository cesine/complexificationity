'use strict';
/* globals Promise */

var Corpus = require('ilanguage/js/corpus/Corpus').Corpus;
var config = require('../config');
var debug = require('debug')('model:codebase');
var fs = require('fs');
var GitImport = require('fielddb/api/import/GitImport').GitImport;
var mkdirp = require('mkdirp');
var nano = require('nano')(config.db.url);
var db = nano.db.use(config.db.database);

/**
 * @class The Codebase class represents a git repository
 *
 *
 * @description The initialize serves to bind import to all drag and drop events.
 *
 * @extends Corpus
 * @tutorial test/models/codebase.js
 */
var CodeBase = function CodeBase(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = 'CodeBase';
  }
  if (!options) {
    options = {};
  }

  options.datumFields = [{
    type: 'DatumField',
    id: 'orthography'
  }];

  this.debug('body', 'In CodeBase ', options);
  Corpus.apply(this, [options]);
};

/**
 * Static members and functions
 */
// GitImport.IMPORT_DIR = '/tmp/imported_codebases/complexificationity': ;

CodeBase._readFile = function(options, callback) {
  debug('calling fs.readFile', options.uri);
  fs.readFile(options.uri, 'utf8', callback);
};

CodeBase._preprocessDatum = function(datum) {
  debug('preprocessing datum');
  // datum.debugMode = true;
  return datum.extractStats();
};

CodeBase._writePreprocessedDatum = function(options, callback) {
  options.preprocessedUri = '.' + options.preprocessedUri;
  var path = options.preprocessedUri.substring(0, options.preprocessedUri.lastIndexOf('/'));
  mkdirp(path, function(err) {
    if (err) {
      debug('Error making preprocess dir', err);
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(options.preprocessedUri, options.body, 'utf8', callback);
  });
};

/**
 * Instance members and functions
 */

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

  import: {
    value: function() {
      var self = this;

      if (!this.importer) {
        this.importer = new GitImport({
          corpus: this
        });
      }

      this.whenCloned = new Promise(function(resolve, reject) {
        var options = {
          remoteUri: 'https://github.com/expressjs/express.git',
          readOptions: {
            readFileFunction: CodeBase._readFile
          },
          fileExtensions: ['.js', '.json'],
          preprocessOptions: {
            preprocessFunction: CodeBase._preprocessDatum,
            writePreprocessedFileFunction: CodeBase._writePreprocessedDatum,
            transliterate: false,
            joinLines: false,
          },
          importOptions: {
            dryRun: true,
            fromPreprocessedFile: true
          }
        };
        self.importer.session.goal = 'Import from git repo';
        self.importer.session.datalist.title = 'Files of ' + self.id + ' as of ' + new Date().toUTCString;

        self.importer.debugMode = true;
        self.importer.clone(options)
          .then(function(result) {
            self.importer.debug('result of clone', result.cloneMessage);

            // run a subset
            result.dbname = 'express/lib/middleware';

            return self.importer.findFiles(options);
          }, reject)
          .then(function(result) {
            self.importer.debug('result of find files', result.fileTree);
            self.importer.fileTree = options.fileTree;
            self.importer.fileList = options.fileList;
            return self.importer.addFileUris(options);
          }, reject)
          .then(function(result) {
            self.importer.debug('after add files', options);
            self.importer.fileExtensions = options.fileExtensions;
            self.importer.importOptions = options.importOptions;
            resolve(self);
          }, reject)
          .fail(reject);
      });

      return this.whenCloned;
    }
  },

  calculateComplexificationity: {
    value: function() {

    }
  },

  save: {
    value: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        if (self.rev) {
          self._rev = self.rev;
        } else {
          self.dateCreated = Date.now();
        }
        self.dateModified = Date.now();

        var json = self.toJSON();
        json._id = self.id;

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
