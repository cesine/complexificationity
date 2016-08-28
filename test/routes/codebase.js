'use strict';

var expect = require('chai').expect;

var codebase = require('./../../routes/codebase');

describe('codebase routes', function() {
  it('should load', function() {
    expect(codebase).to.be.a('object');
    expect(codebase.router).to.be.a('function');
    expect(codebase.getCodeBase).to.be.a('function');
    expect(codebase.getList).to.be.a('function');
  });
});
