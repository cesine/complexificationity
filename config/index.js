'use strict';

var fs = require('fs');

var config = {
  url: 'https://localhost:8010',
  ssl: {
    key: fs.readFileSync(__dirname + '/ssl_debug.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/ssl_debug.crt', 'utf8')
  },
  db: {
    database: process.env.COMPLEXIFICATIONITY_DB || 'complexificationity',
    user: process.env.COMPLEXIFICATIONITY_DB_USERNAME || 'admin',
    password: process.env.COMPLEXIFICATIONITY_DB_PASSWORD || 'none'
  }
};

config.db.url = 'http://' + config.db.user + ':' + config.db.password + '@localhost:5984';

module.exports = config;
