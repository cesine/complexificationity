'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe('/oauth', function() {
  describe('POST /oauth/authorize', function() {
    it('should redirect to login if user is not present', function(done) {
      supertest(service)
        .post('/oauth/authorize')
        .query({
          client_id: 'test-client',
          client_secret: 'test-secret',
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:8011/users'
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

    it('should return 401 if no authentication is given', function(done) {
      supertest(service)
        .post('/oauth/authorize')
        .query({
          client_id: 'test-client',
          client_secret: 'test-secret',
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:8011/users'
        })
        .set('Authorization', 'Bearer v1/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjp7ImdpdmVuTmFtZSI6IiIsImZhbWlseU5hbWUiOiIifSwiaWQiOiJ0ZXN0LXVzZXItZWZnX3JhbmRvbV91dWlkIiwicmV2aXNpb24iOiIxLTE0NjgyMDUzMDkwNjkiLCJkZWxldGVkQXQiOm51bGwsImRlbGV0ZWRSZWFzb24iOiIiLCJ1c2VybmFtZSI6InRlc3QtdXNlciIsImVtYWlsIjoiIiwiZ3JhdmF0YXIiOiI5Y2I0Nzk4ODc0NTkzNTI5MjhkNDEyNmY4OTg0NTRjZiIsImRlc2NyaXB0aW9uIjoiIiwibGFuZ3VhZ2UiOiIiLCJoYXNoIjoiJDJhJDEwJDUxOWkxeW5lQkw0cEgzaVRNdG51b09hRjZkbnFDV041QmgxRDh1bzY4S3pRWTdEcklHeFlxIiwiY3JlYXRlZEF0IjoiMjAxNi0wNy0xMVQwMjo0ODoyOS4xNTVaIiwidXBkYXRlZEF0IjoiMjAxNi0wNy0xMVQwMjo0ODoyOS4xNTVaIiwiaWF0IjoxNDY4MjEyMTY3fQ.HCOkTzqR4v-vSSmoXqTS6vHnZPbgWaEDEL2T6iqzwTdnF58sm_ufnFMDmWfxWzBMc15Y--2oCSEhAPdTVfMqh_h4CSkqDNH10MSCrF346OKHLugFT3BUSuvE6NMszBnItBX8P2r7lc6hhLnpbI4lvslCfQNI3PCoQssbmT1IZ3k')
        .expect(401)
        .expect('Content-Type', 'application/json; charset=utf-8')
        // .expect({
        //   access_token: 'foobar',
        //   token_type: 'bearer'
        // })
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            error: res.body.error,
            status: 401,
            message: 'Unauthorized request: no authentication given'
          });

          done();
        });
    });
  });

  describe('POST /oauth/token', function() {
    it('should validate the authorization code', function(done) {
      supertest(service)
        .post('/oauth/token')
        .type('form') // content must be application/x-www-form-urlencoded
        .send({
          client_id: 'test-client',
          client_secret: 'test-secret',
          grant_type: 'authorization_code',
          username: 'test-user',
          code: 'ABC'
        })
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
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
