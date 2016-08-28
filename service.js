'use strict';

var bodyParser = require('body-parser');
var debug = require('debug')('service');
var express = require('express');
var morgan = require('morgan');

var errorsMiddleware = require('./middleware/error');
var routes = require('./routes/index').router;
var codebaseRoutes = require('./routes/codebase').router;

var service = express();

var env = process.env.NODE_ENV || 'development';
service.locals.ENV_DEVELOPMENT = env === 'development';

/**
 * Config
 */
service.use(morgan('combined'));

/**
 * Body parsers
 */
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * Middleware
 */

/**
 * Routes
 */
service.use('/v1/codebases', codebaseRoutes);
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
