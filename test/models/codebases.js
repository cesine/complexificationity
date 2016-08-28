'use strict';

var expect = require('chai').expect;

var CodeBases = require('./../../models/codebases').CodeBases;

describe.only('codebases', function() {
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
    CodeBases._list = [{}, {}, {}];
    CodeBases._listExpires = Date.now() + 1000;

    return CodeBases.list().then(function(list) {
      expect(list.length).to.equal(3);
    });
  });

  it('should list a public view of all codebases', function() {
    return CodeBases.list().then(function(list) {
      expect(list.length).to.equal(0);
    });
  });
});
