'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe.only('/authenticate', function() {
  describe('GET /authenticate/login', function() {
    it('should display', function(done) {
      supertest(service)
        .get('/authenticate/login/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Login');
          expect(res.text).to.contain('button');
          expect(res.text).to.contain('Password');

          done();
        });
    });

    it('should serve client side files', function(done) {
      supertest(service)
        .get('/authenticate/login/login.js')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).equal('');

          done();
        });
    });

    it('should redirect to login/', function(done) {
      supertest(service)
        .get('/authenticate/login?anything=query_should_be_kept')
        .expect(303)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Redirecting');
          expect(res.text).to.contain('?anything=query_should_be_kept');

          done();
        });
    });
  });

  describe('POST /authenticate/login', function() {
    it('should require a body', function(done) {
      supertest(service)
        .post('/authenticate/login')
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a username and a password',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should require a username', function(done) {
      supertest(service)
        .post('/authenticate/login')
        .send({
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a username and a password',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should require a password', function(done) {
      supertest(service)
        .post('/authenticate/login')
        .send({
          username: 'test-user',
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a username and a password',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should login and redirect to the requested url', function(done) {
      supertest(service)
        .post('/authenticate/login?client_id=abc-li-12-li&redirect_uri=http%3A%2F%2Flocalhost%3A8011%2Fsome%2Fplace%2Fusers%3Fwith%3Dother-stuff')
        .send({
          username: 'test-user',
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Found. Redirecting');
          expect(res.text).to.contain('to /oauth/authorize/as?client_id=abc-li-12-li&redirect_uri=http://localhost:8011/some/place/users?with=other-stuff');

          done();
        });
    });
  });

  describe.only('GET /authenticate/signup', function() {
    it('should display', function(done) {
      supertest(service)
        .get('/authenticate/signup/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Signup');
          expect(res.text).to.contain('button');
          expect(res.text).to.contain('Password');

          done();
        });
    });

    it('should serve client side files', function(done) {
      supertest(service)
        .get('/authenticate/signup/signup.js')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).equal('');

          done();
        });
    });

    it('should redirect to signup/', function(done) {
      supertest(service)
        .get('/authenticate/signup?anything=query_should_be_kept')
        .expect(303)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Redirecting');
          expect(res.text).to.contain('?anything=query_should_be_kept');

          done();
        });
    });
  });

});
