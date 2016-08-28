'use strict';

var config = require('../../config');
var expect = require('chai').expect;
var nock = require('nock');
var fixtures = require('../fixtures/codebases.json');
var CodeBases = require('../../models/codebases').CodeBases;

describe('codebases', function() {
  before(function() {
    nock.disableNetConnect();
  });

  beforeEach(function() {
    CodeBases._list = null;
    CodeBases._listTTL = 500;
    CodeBases._listExpires = Date.now() - 1000 - CodeBases._listTTL;
  });

  describe('interface', function() {
    it('should load', function() {
      expect(CodeBases).to.be.defined;
      expect(CodeBases.list).to.be.defined;
      expect(CodeBases._list).to.be.defined;
      expect(CodeBases._listTTL).to.be.defined;
      expect(CodeBases._listExpires).to.be.defined;
    });
  });

  it('should cache the list', function() {
    var couchdb = nock(config.db.url)
      .get('/' + config.db.database + '/_design/codebases/_view/public')
      .reply(200, fixtures);

    CodeBases._list = {
      rows: [{}, {}]
    };
    CodeBases._listExpires = Date.now() + 1000;

    return CodeBases.list().then(function(list) {
      expect(list.rows.length).to.equal(2);

      expect(couchdb.isDone()).to.be.false;
      nock.cleanAll();
    });
  });

  it('should list a public view of all codebases', function() {
    var couchdb = nock(config.db.url)
      .get('/' + config.db.database + '/_design/codebases/_view/public')
      .reply(200, fixtures);

    return CodeBases.list().then(function(list) {
      expect(list.rows.length).to.equal(3);
      expect(couchdb.isDone()).to.be.true;
    });
  });
});
