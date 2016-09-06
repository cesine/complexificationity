'use strict';
/* globals Promise */

var expect = require('chai').expect;
var supertest = require('supertest');

var api = require('./../../');
var CodeBase = require('./../../models/codebase').CodeBase;

describe('/v1/codebases', function() {
  describe('GET', function() {
    before(function() {
      return Promise.all([
        new CodeBase({
          id: 'test/integration1',
          complexificationity: 0.6739451919245738
        }).save(),
        new CodeBase({
          id: 'test/integration2',
          complexificationity: 0.9609969120528077
        }).save(),
        new CodeBase({
          id: 'test/integration3',
          complexificationity: 0.18303309365731346
        }).save()
      ]).catch(function(err) {
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

          console.log(res.body);
          expect(res.body).to.include.keys([
            'total_rows',
            'offset',
            'rows'
          ]);

          expect(res.body.rows[0]).to.include.keys([
            'id',
            'key',
            'value'
          ]);

          expect(res.body.rows[0].value).to.include.keys([
            'title',
            'description',
            'gravatar',
            'language',
            'complexificationity'
          ]);
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

          expect(res.body.id).to.equal('test/integration1');
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

    it.skip('should support just a url', function(done) {
      supertest(api)
        .get('/v1/codebases?url=https%3A%2F%2Fsomewhere.com%2Ftest%2Fintegration1.git')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body.id).to.equal('test/integration1');
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

    it('should verify identifier', function(done) {
      supertest(api)
        .get('/v1/codebases/notagithubslug')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body).to.deep.equal({
            message: 'Invalid GitHub slug should be format owner/repo',
            error: res.body.error,
            status: 400
          });

          done();
        });
    });
  });

  describe('POST', function() {
    var codebase = {
      id: 'expressjs/errorhandler'
    };

    it('should verify identifier', function(done) {
      supertest(api)
        .post('/v1/codebases/notagithubslug')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body).to.deep.equal({
            message: 'Invalid GitHub slug should be format owner/repo',
            error: res.body.error,
            status: 400
          });

          done();
        });
    });

    it.skip('should reply not found', function(done) {
      this.timeout(30 * 1000);
      var x = Date.now();

      supertest(api)
        .post('/v1/codebases/expressjs%2Ferrorhandler' + x)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body).to.deep.equal({
            error: res.body.error,
            message: 'https://github.com/expressjs/errorhandler' + x + '.git not found',
            status: 404
          });
          done();
        });
    });

    it('should create', function(done) {
      supertest(api)
        .post('/v1/codebases/expressjs%2Ferrorhandler')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          if (res.body.status) {
            expect(res.body).to.deep.equal({
              message: 'Document update conflict.',
              error: res.body.error,
              status: 409
            });
          } else {
            console.log('created ', res.body);
            expect(res.body).to.include.keys([
              'fieldDBtype',
              'id',
              'version',
              'api',
              '_rev',
              'dateCreated',
              'dateModified',
              'complexificationity',
              'team',
              'stats'
            ]);
            codebase = res.body;
          }

          done();
        });
    });

    it('should reply 409 confict if it already exists', function(done) {
      supertest(api)
        .post('/v1/codebases/' + encodeURIComponent(codebase.id))
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body).to.deep.equal({
            message: 'Document update conflict.',
            error: res.body.error,
            status: 409
          });

          done();
        });
    });
  });

  describe('PUT', function() {
    var codebase;
    this.timeout(10 * 1000);

    before(function(done) {
      supertest(api)
        .get('/v1/codebases/expressjs%2Ferrorhandler')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          codebase = new CodeBase(res.body);

          done();
        });
    });

    it('should verify identifier', function(done) {
      supertest(api)
        .put('/v1/codebases/notagithubslug')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body).to.deep.equal({
            message: 'Invalid GitHub slug should be format owner/repo',
            error: res.body.error,
            status: 400
          });

          done();
        });
    });

    it('should update', function(done) {
      supertest(api)
        .put('/v1/codebases/expressjs%2Ferrorhandler')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          console.log('updated ', res.body);
          expect(res.body).to.include.keys([
            'fieldDBtype',
            'id',
            'version',
            'api',
            '_rev',
            'dateCreated',
            'dateModified',
            'datumFields',
            'complexificationity',
            'team',
            'stats',
            'importer',
            'whenCloned'
          ]);

          expect(res.body._rev).to.not.equal(codebase._rev);

          done();
        });
    });
  });
});
