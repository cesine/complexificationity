'use strict';

var expect = require('chai').expect;

var oauth = require('./../../routes/oauth');

describe('oauth routes', function() {
  it('should load', function() {
    expect(oauth).to.be.a('object');
    expect(oauth.router).to.be.a('function');
    expect(oauth.getAuthorize).to.be.a('function');
    expect(oauth.getToken).to.be.a('function');
    expect(oauth.postAuthorize).to.be.a('function');
    expect(oauth.postToken).to.be.a('function');
  });
});
