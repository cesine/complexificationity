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

  it('should postToken', function() {
    oauth.postToken({
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      query: {}
    }, {
      headers: {},
      set: function() {},
      status: function() {
        return this;
      },
      send: function() {
        return this;
      }
    }, function(err, res) {
      expect(true).to.be.true;
      expect(err).to.be.undefined;
      expect(res).to.be.undefined;
    });
  });
});
