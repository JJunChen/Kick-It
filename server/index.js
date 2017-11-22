const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require("https");
const getEvents = require('../lib/eventbrite.js');
const Promise = require('bluebird');
const PORT = process.env.PORT || 3000;


const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../client/dist'));

// within one of the initialized routes, i want to call getEvents.month
// app.get('/storeMonth', function (req, res) {
//   return getEvents.month().then((data) =>{
//     // ### save data to DB.
//     res.statusCode();
//     res.end();
//     });
// });

app.get('/loadWeekend', function (req, res) {
  getEvents.month()
    .then((data)=> {
      //save to DB
    })
  getEvents.week()
    .then((data) =>{
      res.json(data);
    });
});

app.get('/loadToday', function (req, res) {
  getEvents.today()
    .then((data) =>{
      res.json(data);
    });
});
    

app.listen(PORT, function() {
  console.log('listening on port 3000!');
});
