const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = require('./router');
const db = require('./db');
const DB = new db();
const path = require('path');
const Update = require('./update.js');
let server = require('http').Server(app);

const publicPath = path.join(__dirname, '../public/');

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', router);


server.listen(3001, () => {
  let update = new Update();
  update.init();
  DB.connect();
  console.log('We are live on ' + 3001);
})