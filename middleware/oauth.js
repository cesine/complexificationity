'use strict';

var OAuthServer = require('express-oauth-server');
var ApiClient  = require('./../models/api-client').ApiClient;

var oauth = new OAuthServer({
  debug: true,
  model: ApiClient, // See https://github.com/thomseddon/node-oauth2-server for specification
});

console.log('oauth', oauth);
module.exports = oauth;
