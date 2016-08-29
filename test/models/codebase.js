'use strict';

var expect = require('chai').expect;

var CodeBase = require('./../../models/codebase').CodeBase;
var fixtures = {
  data: require('../fixtures/data.json'),
  stats: require('../fixtures/stats.json')
};

describe('codebase model', function() {
  describe('construction', function() {
    var codebase = new CodeBase({
      id: 'test/123'
    });
    expect(codebase.id).to.equal('test/123');
  });

  describe('serialization', function() {
    var codebase = new CodeBase({
      id: 'test/123'
    });

    var json = codebase.toJSON();
    expect(json).to.include.keys([
      'fieldDBtype',
      'id',
      'version',
      'api',
      'team'
    ]);
  });

  describe('persistance', function() {
    var codebase;
    var testingId = 'test/' + Date.now();

    before(function() {
      codebase = new CodeBase({
        id: testingId,
      });

      return codebase.save();
    });

    after(function() {
      return codebase.delete().then(function(result) {
        expect(result.ok).to.be.true;
      }).catch(function(err) {
        expect(err.statusCode).to.equal(404);
      });
    });

    it('should create', function() {
      expect(codebase.id).to.equal(testingId);
      expect(codebase.rev).to.be.defined;
      expect(codebase.dateCreated).to.be.defined;
      expect(codebase.dateModified).to.be.defined;
    });

    it('should return not found', function() {
      var codebase = new CodeBase({
        id: 'test/notfound',
        // debugMode: true
      });

      return codebase.fetch().catch(function(err) {
        expect(err.statusCode).to.equal(404);

        expect(codebase.id).to.equal('test/notfound');
        expect(codebase.rev).to.equal('');

        var json = codebase.toJSON();
        expect(json).to.not.include.keys([
          '_rev',
          'dateCreated',
          'dateModified'
        ]);
      });
    });

    it('should fetch', function() {
      return codebase.fetch().then(function(result) {
        expect(result).to.equal(codebase);

        expect(codebase.id).to.equal(testingId);
        expect(codebase.rev).to.be.defined;

        var json = codebase.toJSON();
        expect(json).to.include.keys([
          'id',
          '_rev',
          'dateCreated',
          'dateModified'
        ]);
      });
    });

    it('should update', function() {
      var previousRev = codebase.rev;
      var previousDescription = codebase.description || '';
      codebase.description = previousDescription + 'Testing';

      return codebase.save().then(function(result) {
        expect(result).to.equal(codebase);

        expect(codebase.rev).to.not.equal(previousRev);
        expect(codebase.description).to.not.equal(previousDescription);
      });
    });

    it('should delete', function() {
      return codebase.delete().then(function(result) {
        var rev = result.rev.split('-')[0];
        expect(rev).to.equal('3');
        expect(result).to.include.keys([
          'ok',
          'id',
          'rev'
        ]);
      });
    });
  });

  describe.only('complexificationity', function() {
    var codebase;

    before('should be able to import from a git repo', function() {
      codebase = new CodeBase({
        id: 'expressjs/express'
      });
    });

    it('should import from git', function() {
      this.timeout(10 * 1000);

      return codebase.import()
        .then(function(result) {
          expect(result).to.equal(codebase);

          expect(codebase.importer.fileList).to.deep.equal([
            'imported_corpora/express/lib/middleware/init.js',
            'imported_corpora/express/lib/middleware/query.js'
          ]);

          expect(codebase.importer.fileTree).to.deep.equal({
            path: 'imported_corpora/express/lib/middleware',
            name: 'middleware',
            children: codebase.importer.fileTree.children,
            size: codebase.importer.fileTree.size
          });

          expect(codebase.importer.fileExtensions).to.deep.equal(['.js', '.json']);

          expect(codebase.importer.importOptions).to.deep.equal({
            dryRun: true,
            fromPreprocessedFile: true
          });

          expect(codebase.importer.session.goal).to.equal('Import from git repo');

          expect(codebase.importer.datalist.title).to.include('Files of');
          expect(codebase.importer.datalist.title).to.include(codebase.id);

          expect(codebase.importer.datalist.length).to.equal(2);
          expect(codebase.importer.datalist.length).to.equal(
            codebase.importer.fileList.length);

          expect(codebase.importer.datalist.docs
            .collection['query.js']).to.be.defined;
          expect(codebase.importer.datalist.docs
            .collection['init.js']).to.be.defined;
        });
    });

    it('should calculate basic stats', function() {
      codebase.importer.datalist.docs = [];
      codebase.debug('docs', codebase.importer.datalist.docs);

      codebase.importer.datalist.add(new CodeBase.DEFAULT_DATUM(fixtures.data[0]));
      codebase.importer.datalist.add(new CodeBase.DEFAULT_DATUM(fixtures.data[1]));
      codebase.debug('docs', codebase.importer.datalist.docs);

      expect(codebase.importer.datalist.docs['express/lib/middleware/query.js'])
        .to.be.defined;
      expect(codebase.importer.datalist.docs['express/lib/middleware/query.js'].fieldDBtype)
        .to.equal('ComputationalLinguisticsDatum');

      var stats = codebase.calculateStats();

      expect(codebase.importer.datalist.docs['express/lib/middleware/query.js']
        .stats.tokens.characters.unigrams).to.equal(862);
      expect(codebase.importer.datalist.docs['express/lib/middleware/init.js']
        .stats.tokens.words.unigrams).to.equal(94);

      expect(stats).to.deep.equal(fixtures.stats);
    });

    it('should calculate code metrics', function() {
      codebase.stats = fixtures.stats;
      codebase.calculateCodeMetrics();

      expect(codebase.stats.codeMetrics).to.deep.equal({
        indentation: 0.16253101736972705,
        dot: 0.014267990074441687,
        uppercase: 0.0012406947890818859
      });
    });
  });
});
