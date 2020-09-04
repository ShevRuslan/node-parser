const mongoose = require('mongoose');
const config = require('../config/');

module.exports = class {
  connect = async () => {
    let connection = await mongoose.connect(config.db_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(connection);
    return connection;
  };
  disconnect = async () => {
    let res = await mongoose.disconnect();

    return res;
  };
};