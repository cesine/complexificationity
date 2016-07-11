'use strict';

var debug = require('debug')('oauth:model');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var uuid = require('node-uuid');

var OAuthError = require('oauth2-server/lib/errors/oauth-error');
var OAuthToken = require('./oauth-token');
var User = require('./user');

var sequelize = new Sequelize('database', 'id', 'password', {
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: 'db/oauth_clients.sqlite'
});

var oauthClient = sequelize.define('oauth_clients', {
  client_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  client_secret: Sequelize.TEXT,
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  contact: Sequelize.TEXT,
  redirect_uri: Sequelize.TEXT,
  hour_limit: Sequelize.BIGINT, // requests per hour
  day_limit: Sequelize.BIGINT, // requests per calendar day
  throttle: Sequelize.INTEGER, // miliseconds
  deletedAt: Sequelize.DATE,
  deleted_reason: Sequelize.TEXT
});

/**
 * Create a oauth client in the database
 * @param  {oauthClient}   client
 * @param callback
 */
function create(options, callback) {
  if (!options) {
    return callback(new Error('Invalid Options'));
  }

  oauthClient
    .create(options)
    .then(function(dbModel) {
      callback(null, dbModel.toJSON());
    })
    .catch(callback);
}

/**
 * Read an oauth client from the database
 * @param  {oauthClient}   client
 * @param callback
 */
function read(client, callback) {
  var options = {
    where: client
  };

  oauthClient
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
 * List oauth client matching the options
 * @param  {String} options [description]
 * @param callback        [description]
 */
function list(options, callback) {
  options = options || {};
  options.limit = options.limit || 10;
  options.offset = options.offset || 0;
  options.where = options.where || {
    deletedAt: null
  };

  options.attributes = ['client_id', 'title', 'description', 'contact', 'createdAt', 'deleted_reason'];

  oauthClient
    .findAll(options)
    .then(function(oauth_clients) {
      if (!oauth_clients) {
        return callback(new Error('Unable to fetch oauthClient collection'));
      }

      callback(null, oauth_clients.map(function(dbModel) {
        return dbModel.toJSON();
      }));
    })
    .catch(callback);
}

/**
 * Delete oauth_clients matching the options
 * @param  {String} options [description]
 * @param callback        [description]
 */
function flagAsDeleted() {
  throw new Error('Unimplemented');
}

/**
 * Initialize the table if not already present
 * @param callback        [description]
 */
function init() {
  return sequelize.sync();
}


/*
 * OAuth2 Provider Model
 * https://github.com/oauthjs/node-oauth2-server/wiki/Model-specification
 */

/*
 * Get access client.
 */

var getAccessToken = function(bearerToken, callback) {
  OAuthToken.read({
    access_token: bearerToken
  }, function(err, token) {
    if (err) {
      return callback(err);
    }
    if (!token) {
      return callback(null);
    }

    callback(null, {
      accessToken: token.access_token,
      clientId: token.client_id,
      expires: token.access_token_expires_on,
      userId: token.user_id
    });
  });
};

/**
 * Get client.
 * Only seems to support a promise
 * https://github.com/oauthjs/node-oauth2-server/issues/277
 * Despite saying others are possible
 * https://github.com/oauthjs/node-oauth2-server#upgrading-from-2x
 */
var AUTHORIZATION_CODE_TRANSIENT_STORE = {};
var getClient = function(clientId, clientSecret) {
  debug('getClient', arguments);

  return new Promise(function(resolve, reject) {
    read({
      client_id: clientId,
      client_secret: clientSecret
    }, function(err, client) {
      if (err) {
        return reject(err);
      }
      if (!client) {
        return reject(new Error('Client id or Client Secret is invalid'));
      }

      // https://github.com/oauthjs/express-oauth-server/blob/master/test/integration/index_test.js#L144
      // Seems to require a grants
      // { grants: ['password'] }
      // { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
      var code = uuid.v4();
      var json = {
        clientId: client.client_id,
        clientSecret: client.client_secret,
        grants: ['authorization_code'],
        code: code
      };

      AUTHORIZATION_CODE_TRANSIENT_STORE[code] = json;
      resolve(json);
    })
  });
};

var getAuthorizationCode = function(code) {
  debug('getAuthorizationCode', arguments, AUTHORIZATION_CODE_TRANSIENT_STORE);

  return new Promise(function(resolve, reject) {
    var client = AUTHORIZATION_CODE_TRANSIENT_STORE[code];
    if (client) {
      delete AUTHORIZATION_CODE_TRANSIENT_STORE[code];
      return resolve(client);
    }
    var err = new OAuthError('Code is not authorized', {
      code: 403
    });
    err.status = 403;

    reject(err);
  });
};

var revokeAuthorizationCode = function(code) {
  debug('revokeAuthorizationCode', arguments);

  return new Promise(function(resolve, reject) {
    delete AUTHORIZATION_CODE_TRANSIENT_STORE[code];

    resolve(true);
  });
};
/**
 * Get refresh token.
 */

var getRefreshToken = function(bearerToken, callback) {
  OAuthToken.read({
    refresh_token: bearerToken
  }, function(err, token) {
    if (err) {
      return callback(err);
    }
    if (!token) {
      return callback(null);
    }

    callback(null, {
      accessToken: token.access_token,
      clientId: token.client_id,
      expires: token.access_token_expires_on,
      userId: token.user_id
    });
  });
};

/*
 * Get user.
 */

var getUser = function(username, password, callback) {
  User.verifyPassword({
    username: username,
    password: password
  }, function(err, profile) {
    if (err) {
      return callback(err);
    }
    if (!profile) {
      return callback(null);
    }

    callback(null, profile.id);
  });
};

/**
 * Save token.
 */

var saveAccessToken = function(token, client, user, callback) {
  if (!token || !client || !user) {
    return callback(new Error('Invalid Options'));
  }

  OAuthToken.create({
    access_token: token.accessToken,
    access_token_expires_on: token.accessTokenExpiresOn,
    client_id: client.id,
    refresh_token: token.refreshToken,
    refresh_token_expires_on: token.refreshTokenExpiresOn,
    user_id: user.id
  }, function(err, token) {
    if (err) {
      return callback(err);
    }
    if (!token) {
      return callback(null);
    }

    // https://github.com/oauthjs/express-oauth-server/blob/master/test/integration/index_test.js#L238
    // {
    //   accessToken: 'foobar',
    //   client: {},
    //   user: {}
    // };

    callback(null, {
      access_token: token.access_token,
      access_token_expires_on: token.access_token_expires_on,
      client_id: token.client_id,
      refresh_token: token.refresh_token,
      refresh_token_expires_on: token.refresh_token_expires_on,
      user_id: token.user_id
    });
  });
};

module.exports.create = create;
module.exports.flagAsDeleted = flagAsDeleted;
module.exports.init = init;
module.exports.list = list;
module.exports.read = read;

module.exports.getAccessToken = getAccessToken;
module.exports.getAuthorizationCode = getAuthorizationCode;
module.exports.revokeAuthorizationCode = revokeAuthorizationCode;
module.exports.getClient = getClient;
module.exports.getRefreshToken = getRefreshToken;
module.exports.getUser = getUser;
module.exports.saveAccessToken = saveAccessToken;
module.exports.saveToken = saveAccessToken;
