/**
 * Module dependencies.
 */

var pg = require('pg-promise')(process.env.DATABASE_URL);
var OAuthToken = require('./oauth-token');

/*
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
  return OAuthToken.read({
      access_token: bearerToken
    })
    .then(function(token) {
      return {
        accessToken: token.access_token,
        clientId: token.client_id,
        expires: token.expires,
        userId: token.userId
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = function*(clientId, clientSecret) {
  return pg.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2', [clientId, clientSecret])
    .then(function(result) {
      var oAuthClient = result.rows[0];

      if (!oAuthClient) {
        return;
      }

      return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function*(bearerToken) {
  return OAuthToken.read({
    refresh_token: bearerToken
  }).then(function(result) {
    return result;
  });
};

/*
 * Get user.
 */

module.exports.getUser = function*(username, password) {
  return pg.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password])
    .then(function(result) {
      return result.rowCount ? result.rows[0] : false;
    });
};

/**
 * Save token.
 */

module.exports.saveAccessToken = function*(token, client, user) {
  return oauthToken.create({
    client: client,
    token: token,
    user: user
  });
};
