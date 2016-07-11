'use strict';
/*jshint camelcase: false */

var Sequelize = require('sequelize');

var sequelize = new Sequelize('database', 'id', 'password', {
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: 'db/oauth_tokens.sqlite'
});

var oauthToken = sequelize.define('oauth_tokens', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  access_token: Sequelize.TEXT,
  access_token_expires_on: Sequelize.DATE,
  client_id: Sequelize.TEXT,
  deletedAt: Sequelize.DATE,
  deletedReason: Sequelize.TEXT,
  refresh_token: Sequelize.TEXT,
  refresh_token_expires_on: Sequelize.DATE,
  user_id: {
    type: Sequelize.UUID
  }
});

/**
 * Create a oauth token in the database
 * @param  {oauthToken}   token
 * @return {Promise}
 */
function create(options, callback) {
  if (!options) {
    return callback(new Error('Invalid Options'));
  }

  oauthToken
    .create(options)
    .then(function(dbToken) {
      callback(null, dbToken.toJSON());
    })
    .catch(callback);
}

/**
 * Read an oauth token from the database
 * @param  {oauthToken}   token
 * @return {Promise}
 */
function read(token, callback) {
  var options = {
    where: {}
  };

  if (token.access_token && !token.refresh_token) {
    options.where = {
      access_token: token.access_token
    };
  } else if (token.refresh_token && !token.access_token) {
    options.where = {
      refresh_token: token.refresh_token
    };
  } else {
    return callback(new Error('Read tokens by  either access_token or refresh_token'));
  }

  oauthToken
    .find(options)
    .then(function(dbModel) {
      if (!dbModel) {
        return callback(null, null);
      }
      callback(null, dbModel.toJSON());
    })
    .catch(callback);
}

/**
 * List oauth token matching the options
 * @param  {String} options [description]
 * @return {Promise}        [description]
 */
function list(options, callback) {
  options = options || {};
  options.limit = options.limit || 10;
  options.offset = options.offset || 0;
  options.where = options.where || {
    deletedAt: null
  };

  options.attributes = ['access_token', 'client_id', 'user_id', 'deletedReason'];

  oauthToken
    .findAll(options)
    .then(function(oauth_tokens) {
      if (!oauth_tokens) {
        return callback(new Error('Unable to fetch oauthToken collection'));
      }

      callback(null, oauth_tokens.map(function(dbModel) {
        return dbModel.toJSON();
      }));
    })
    .catch(callback);
}

/**
 * Delete oauth_tokens matching the options
 * @param  {String} options [description]
 * @return {Promise}        [description]
 */
function flagAsDeleted() {
  throw new Error('Unimplemented');
}

/**
 * Initialize the table if not already present
 * @return {Promise}        [description]
 */
function init() {
  return sequelize.sync();
}

module.exports.create = create;
module.exports.flagAsDeleted = flagAsDeleted;
module.exports.init = init;
module.exports.list = list;
module.exports.read = read;
