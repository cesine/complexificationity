'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');
var jsonwebtoken = require('jsonwebtoken');

var config = require('./../../config');
var service = require('./../../');
var User = require('./../../models/user');

describe('/authentication', function() {
  before(function(done) {
    User.init();

    User.create({
      id: 'test-user-efg_random_uuid',
      username: 'test-user',
      password: 'aje24wersdfgs324rfe+woe'
    }, function() {
      done();
    });
  });

  describe('GET /authentication/login', function() {
    it('should display', function(done) {
      supertest(service)
        .get('/authentication/login/')
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
        .get('/authentication/login/login.js')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('login');

          done();
        });
    });

    it('should redirect to login/', function(done) {
      supertest(service)
        .get('/authentication/login?anything=query_should_be_kept')
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

  describe('POST /authentication/login', function() {
    it('should require a body', function(done) {
      supertest(service)
        .post('/authentication/login')
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
        .post('/authentication/login')
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
        .post('/authentication/login')
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
        .post('/authentication/login')
        .send({
          client_id: 'abc-li-12-li',
          redirect_uri: 'http://localhost:8011/some/place/users?with=other-stuff',
          username: 'test-user',
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Set-Cookie', /Authorization=Bearer /)
        .expect('Authorization', /Bearer v1\//)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Found. Redirecting');
          expect(res.text).to.contain('to /oauth/authorize/as?client_id=abc-li-12-li' +
            '&redirect_uri=http://localhost:8011/some/place/users?with=other-stuff');

          var token = res.headers.authorization.replace(/Bearer v1\//, '');
          expect(token).exists;

          var decoded = jsonwebtoken.decode(token);
          expect(decoded).to.deep.equal({
            name: {
              givenName: '',
              familyName: ''
            },
            id: 'test-user-efg_random_uuid',
            revision: decoded.revision,
            deletedAt: null,
            deletedReason: '',
            username: 'test-user',
            email: '',
            gravatar: decoded.gravatar,
            description: '',
            language: '',
            hash: decoded.hash,
            createdAt: decoded.createdAt,
            updatedAt: decoded.updatedAt,
            iat: decoded.iat,
            // exp: decoded.exp
          });

          var verified = jsonwebtoken.verify(token, config.jwt.public, {
            algorithm: config.jwt.algorithm
          });
          expect(verified).to.deep.equal(decoded);

          done();
        });
    });
  });

  describe('GET /authentication/signup', function() {
    it('should display', function(done) {
      supertest(service)
        .get('/authentication/signup/')
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
        .get('/authentication/signup/signup.js')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('signup');

          done();
        });
    });

    it('should redirect to signup/', function(done) {
      supertest(service)
        .get('/authentication/signup?anything=query_should_be_kept')
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

  describe('POST /authentication/register', function() {
    it('should require a body', function(done) {
      supertest(service)
        .post('/authentication/register')
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a username which is 4 characters' +
              ' or longer and a password which is 8 characters or longer',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should require a username', function(done) {
      supertest(service)
        .post('/authentication/register')
        .send({
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a username which is 4 characters' +
              ' or longer and a password which is 8 characters or longer',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should require a password', function(done) {
      supertest(service)
        .post('/authentication/register')
        .send({
          username: 'test-user',
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a password which is 8 characters or longer',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should require non-trivial password', function(done) {
      supertest(service)
        .post('/authentication/register')
        .send({
          username: 'test-user',
          password: 'test'
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Please provide a password which is 8 characters or longer',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should not register an existing username', function(done) {
      supertest(service)
        .post('/authentication/register?client_id=abc-li-12-li&' +
          'redirect_uri=http%3A%2F%2Flocalhost%3A8011%2Fsome%2Fplace%2Fusers%3Fwith%3Dother-stuff')
        .send({
          username: 'test-user',
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            message: 'Username test-user is already taken, please try another username',
            error: res.body.error,
            status: 403
          });

          done();
        });
    });

    it('should register and redirect to the requested url', function(done) {
      supertest(service)
        .post('/authentication/register')
        .send({
          client_id: 'abc-li-12-li',
          redirect_uri: 'http://localhost:8011/some/place/users?with=other-stuff',
          username: 'test-' + Date.now(),
          password: 'aje24wersdfgs324rfe+woe'
        })
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Found. Redirecting');
          expect(res.text).to.contain('to /oauth/authorize/as?client_id=abc-li-12-li&' +
            'redirect_uri=http://localhost:8011/some/place/users?with=other-stuff');

          done();
        });
    });
  });
});
