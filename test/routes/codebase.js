'use strict';

var expect = require('chai').expect;

var codebase = require('./../../routes/codebase');

describe('codebase routes', function() {
  it('should load', function() {
    expect(codebase).to.be.a('object');
    expect(codebase.router).to.be.a('function');
    expect(codebase.getList).to.be.a('function');
    expect(codebase.getCodeBase).to.be.a('function');
    expect(codebase.postCodeBase).to.be.a('function');
    expect(codebase.putCodeBase).to.be.a('function');
  });

  describe('validation', function() {
    it('should validate identifier', function() {
      var req = {
        app: {
          locals: {}
        },
        params: {
          identifier: 'notagithubslug'
        },
        query: {}
      };
      codebase.validateIdentifier(req, {}, function(err) {
        expect(err.message).to.equal('Invalid GitHub slug should be format owner/repo');
      });
    });

    it('should validate identifier matches url', function() {
      var req = {
        app: {
          locals: {}
        },
        params: {
          identifier: 'expressjs/express'
        },
        query: {
          url: 'https://github.com/expressjs/somethingelse.git'
        }
      };
      codebase.validateIdentifier(req, {}, function(err) {
        expect(err.message).to.equal('Git url https://github.com/expressjs/somethingelse.git doesnt match the slug expressjs/express');
      });
    });

    it('should set the url and codebase', function() {
      var req = {
        app: {
          locals: {}
        },
        params: {
          identifier: 'expressjs/express'
        },
        query: {}
      };
      codebase.validateIdentifier(req, {}, function(err) {
        expect(err).to.be.undefined;
        expect(req.query.url).to.equal('https://github.com/expressjs/express.git');

        expect(req.app.locals.codebase.id).to.equal('expressjs/express');
        expect(req.app.locals.codebase.url).to.equal('https://github.com/expressjs/express.git');
      });
    });
  });
});
