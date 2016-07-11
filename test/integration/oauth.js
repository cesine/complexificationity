'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe('/oauth', function() {
  describe.only('POST /oauth/authorize', function() {
    it('should redirect to login if user is not present', function(done) {
      supertest(service)
        .post('/oauth/authorize')
        .query({
          'client_id': 'test-client',
          'client_secret': 'test-secret',
          'grant_type': 'authorization_code',
          'redirect_uri': 'http://localhost:8011/users'
        })
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Found. Redirecting to');
          expect(res.text).to.contain('to /login?client_id=test-client&redirect_uri=http://localhost:8011/users');

          done();
        });
    });
  });

  describe('POST /oauth/token', function() {
    it('should validate the authorization code', function(done) {
      supertest(service)
        .post('/oauth/token')
        .send('client_id=test-client&client_secret=test-secret' +
          '&grant_type=authorization_code&username=test-user&code=ABC')
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        // .expect({
        //   access_token: 'foobar',
        //   token_type: 'bearer'
        // })
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            error: res.body.error,
            status: 403,
            message: 'Code is not authorized'
          });

          done();
        });
    });
  });
});
