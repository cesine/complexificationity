'use strict';

var expect = require('chai').expect;

var CodeBase = require('./../../models/codebase').CodeBase;

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
});
