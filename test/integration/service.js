'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe('/v1', function() {
  it('should load', function() {
    expect(service).to.be.a('function');
  });

  describe('is production ready', function() {
    it('should handle service endpoints which are not found', function(done) {
      process.env.NODE_ENV = 'production';

      supertest(service)
        .get('/v1/notexistant')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(404)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.status).to.equal(404);

          expect(res.body).to.deep.equal({
            error: {},
            message: 'Not Found',
            status: 404
          });

          done();
        });
    });

    it('should reply with healthcheck', function(done) {
      process.env.NODE_ENV = 'development';

      supertest(service)
        .get('/healthcheck')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            ok: true
          });

          done();
        });
    });
  });
});
