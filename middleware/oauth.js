'use strict';

var OAuthServer = require('express-oauth-server');
var OAuthClient  = require('./../models/oauth-client');

var oauth = new OAuthServer({
  debug: true,
  model: OAuthClient, // See https://github.com/thomseddon/node-oauth2-server for specification
});

console.log('oauth', oauth);
module.exports = oauth;
