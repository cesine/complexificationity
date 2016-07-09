'use strict';
var express = require('express');
var router = express.Router();

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
var postToken = oauth.token();

router.get('/authorize', getAuthorize);
router.post('/authorize', postAuthorize);

router.get('/token', getToken);
router.post('/token', postToken;

module.exports.getAuthorize = getAuthorize;
module.exports.getToken = getToken;
module.exports.postAuthorize = postAuthorize;
module.exports.postToken = postToken;
module.exports.router = router;
