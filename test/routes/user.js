'use strict';

var expect = require('chai').expect;

var user = require('./../../routes/user');

describe('user routes', function() {
  it('should load', function() {
    expect(user).to.be.a('object');
    expect(user.router).to.be.a('function');
    expect(user.getUser).to.be.a('function');
    expect(user.getList).to.be.a('function');
  });
});
