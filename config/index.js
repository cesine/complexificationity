var fs = require('fs');

var config = {
  url: 'https://localhost:8010',
  key: {
    algorithm: 'RS256',
    private: fs.readFileSync(__dirname + '/key.pem', 'utf8'),
    public: fs.readFileSync(__dirname + '/key.pub', 'utf8')
  }
};

module.exports = config;
