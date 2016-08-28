'use strict';
/* globals Promise */

var expect = require('chai').expect;
var supertest = require('supertest');

var api = require('./../../');
var CodeBase = require('./../../models/codebase').CodeBase;

describe('/v1/codebases', function() {
  before(function() {
    return Promise.all([
      new CodeBase({
        id: 'test-integration1',
      }).save(),
      new CodeBase({
        id: 'test-integration2',
      }).save(),
      new CodeBase({
        id: 'test-integration3',
      }).save()
    ]).catch(function(err){
      expect(err.statusCode).to.equal(409);
    });
  });

  it('should list codebases', function(done) {
    supertest(api)
      .get('/v1/codebases')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.body.length).to.equal(3);

        done();
      });
  });

  it('should get codebase', function(done) {
    supertest(api)
      .get('/v1/codebases/test%2Fintegration1')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.body.id).to.equal('test-integration1');
        expect(res.body).to.include.keys([
          'fieldDBtype',
          'id',
          'version',
          'api',
          'team'
        ]);

        done();
      });
  });
});
