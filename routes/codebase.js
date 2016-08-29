'use strict';

var debug = require('debug')('routes:codebase');
var express = require('express');
var router = express.Router();

var CodeBase = require('./../models/codebase').CodeBase;
var CodeBases = require('./../models/codebases').CodeBases;

/**
 * Ensure the identifier is a plausible github slug
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function validateIdentifier(req, res, next) {
  debug('looking up ', req.params.identifier);
  var err;

  if (req.params.identifier.indexOf('/') === -1) {
    err = new Error('Invalid GitHub slug should be format owner/repo');
    err.status = 400;
    return next(err);
  }

  if (req.query.url && req.query.url.indexOf(req.params.identifier) === -1) {
    err = new Error('Git url ' + req.query.url + ' doesnt match the slug ' + req.params.identifier);
    err.status = 400;
    return next(err);
  }

  if (!req.query.url) {
    req.query.url = 'https://github.com/' + req.params.identifier + '.git';
  }

  req.app.locals.codebase = new CodeBase({
    id: req.params.identifier,
    url: req.query.url
  });
  debug('added codebase to req ', req.app.locals.codebase);

  next();
}

/**
 * Get a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getCodeBase(req, res, next) {
  req.app.locals.codebase
    .fetch()
    .then(function() {
      res.json(req.app.locals.codebase.toJSON());
    })
    .catch(next);
}

/**
 * Get a list of codebases
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getList(req, res, next) {
  if (req.query.url) {
    req.params.identifier = URL.parse(req.query.url).path;
    return getCodeBase(req, res, next);
  }

  CodeBases.list()
    .then(function(list) {
      res.json(list);
    })
    .catch(next);
}

/**
 * Calculate a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function postCodeBase(req, res, next) {
  debug('POST', req.params);

  req.app.locals.codebase
    .save()
    .then(function() {
      return req.app.locals.codebase.import();
    }).then(function() {
      req.app.locals.codebase.calculateCodeMetrics();
      return req.app.locals.codebase.save();
    }).then(function() {
      res.json(req.app.locals.codebase.toJSON());
    })
    .catch(next);
}

/**
 * Update a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function putCodeBase(req, res, next) {
  debug('PUT', req.params);
  // req.app.locals.codebase.debugMode = true;

  req.app.locals.codebase
    .fetch()
    .then(function() {
      return req.app.locals.codebase.import();
    }).then(function() {
      req.app.locals.codebase.calculateCodeMetrics();
      return req.app.locals.codebase.save();
    }).then(function(results) {
      res.json(req.app.locals.codebase.toJSON());
    }, next)
    .catch(next);
}

router.get('/', getList);
router.get('/:identifier', validateIdentifier, getCodeBase);
router.post('/:identifier', validateIdentifier, postCodeBase);
router.put('/:identifier', validateIdentifier, putCodeBase);

module.exports.validateIdentifier = validateIdentifier;
module.exports.getCodeBase = getCodeBase;
module.exports.postCodeBase = postCodeBase;
module.exports.putCodeBase = putCodeBase;
module.exports.getList = getList;

module.exports.router = router;
