'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var oauth = require('./../../middleware/oauth');

describe.only('oauth middleware', function() {
  it('should load', function() {
    console.log(oauth.debug);
    expect(oauth).to.be.a('object');
    expect(oauth.server).to.be.a('object');
    expect(oauth.server.options).to.be.a('object');
    expect(oauth.server.options.debug).equal(true);
    expect(oauth.server.options.model).to.be.a('object');

    expect(oauth.server.options.model.getClient).to.be.a('function');
    expect(oauth.server.options.model.getUser).to.be.a('function');
    expect(oauth.server.options.model.getAccessToken).to.be.a('function');
    expect(oauth.server.options.model.getRefreshToken).to.be.a('function');
    expect(oauth.server.options.model.saveAccessToken).to.be.a('function');
  });
});
