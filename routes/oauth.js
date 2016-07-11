'use strict';
var debug = require('debug')('oauth:routes');
var express = require('express');
var router = express.Router();

var errorMiddleware = require('./../middleware/error');
var oauth = require('./../middleware/oauth');

/**
 * Get authorization from a given user
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getAuthorize(req, res, next) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri));
  }

  return render('authorize', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
}

/**
 * Authorize an app to a given user's account
 *
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function postAuthorize(req, res, next) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  }

  return oauth.authorize();
}

/**
 * Get an OAuth2 Token
 *
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getToken(req, res, next) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  }

  return oauth.authorize();
}

/**
 * Create an OAuth2 token
 *
 * @type {[type]}
 */
function postToken(req, res, next){
  debug('postToken', req.query, res.headers);

  var middleware = oauth.token({
    handleError: errorMiddleware
  });
  return middleware(req, res, next);
}
// comes from https://github.com/oauthjs/express-oauth-server/blob/master/index.js#L64
// service.use(service.oauth.authorise()); // service.oauth.authorise is not a function

// Comes from https://github.com/oauthjs/node-oauth2-server#quick-start
// service.use(service.oauth.authenticate()); // Invalid argument: `response` must be an instance of Response

router.get('/authorize', getAuthorize);
router.post('/authorize', postAuthorize);

router.get('/token', getToken);
router.post('/token', postToken);

module.exports.getAuthorize = getAuthorize;
module.exports.getToken = getToken;
module.exports.postAuthorize = postAuthorize;
module.exports.postToken = postToken;
module.exports.router = router;
