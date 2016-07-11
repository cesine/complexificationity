'use strict';

var bodyParser = require('body-parser');
var cors = require('cors');
var debug = require('debug')('service');
var express = require('express');
var logger = require('morgan');

var authenticationRoutes = require('./routes/authentication').router;
var oauthRoutes = require('./routes/oauth').router;
var errorsMiddleware = require('./middleware/error');
var routes = require('./routes/index').router;
var userRoutes = require('./routes/user').router;

var service = express();

var env = process.env.NODE_ENV || 'development';
service.locals.ENV_DEVELOPMENT = env === 'development';

/**
 * Config
 */
service.use(logger(env));

/**
 * Body parsers
 */
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * Cross Origin Resource Sharing
 * (permits client sides which are not hosted on the same domain)
 */
service.use(cors());

/**
 * Middleware
 */
// The example attaches it to the express
// https://github.com/oauthjs/express-oauth-server#quick-start
// service.oauth = oauthMiddleware;

/**
 * Routes
 */
service.use('/authenticate', authenticationRoutes);
service.use('/oauth', oauthRoutes);
service.use('/v1/users', userRoutes);
service.use('/', routes);

/**
 * Not found
 */
service.use(function(req, res, next) {
  debug(req.url + ' was not found');
  var err = new Error('Not Found');
  err.status = 404;
  next(err, req, res, next);
});

/**
 * Attach error handler
 */
service.use(errorsMiddleware);

module.exports = service;
