'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var error = require('./../../middleware/error');

describe('error middleware', function() {
  var err = new Error('oops');
  err.status = 500;

  var req = {
    app: {
      locals: {}
    }
  };
  var res = {};

  it('should load', function() {
    expect(error).to.be.a('function');
  });

  describe('api endpoint', function() {
    beforeEach(function() {
      req.url = '/v1/nodata';
      res.json = sinon.spy();
      res.status = sinon.spy();
    });

    describe('in development', function() {
      beforeEach(function() {
        process.env.NODE_ENV = 'development';
      });

      it('should expose stack traces', function() {
        error(err, req, res, function() {});

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.json, {
          error: err,
          message: err.message,
          status: err.status
        });
      });

    });

    describe('in production', function() {
      beforeEach(function() {
        process.env.NODE_ENV = 'production';
      });

      it('should not expose stack traces', function() {
        error(err, req, res, function() {});

        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.json, {
          error: {},
          message: err.message,
          status: err.status
        });
      });
    });
  });
});
