'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var api = require('./../../');
var codebase = require('./../../models/codebase');
var fixtures = {
  codebase: require('./../fixtures/codebase.json')
};

describe('/v1/codebases', function() {
  beforeEach(function() {
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

        expect(res.body.length).to.equal(0);

        done();
      });
  });

  it('should get a codebases details', function(done) {
    supertest(api)
      .get('/v1/codebases/test-anonymouse')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.body.identifier).to.equal('test-anonymouse');

        done();
      });
  });
});
