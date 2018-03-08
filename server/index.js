const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const getEvents = require('../lib/eventbrite.js');
const Promise = require('bluebird');
const moment = require('moment');

const PORT = process.env.PORT || 3000;
const { API_key } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/../client/dist`));

//= =====================================================================
//        Database Functions
//= =====================================================================
const db = require('../database/index.js');

// ======================================================================
//   API month's events + venues -> Save to DB
//   API weekend's events ->  Client
// ======================================================================

app.get('/initialLoad', (req, res) => {
  const responseObj = {};
  let holder = [];
  const start = moment().format();
  const end = moment().add(30, 'day').format();

  const month_options = {
    method: 'GET',
    url: 'https://www.eventbriteapi.com/v3/events/search',
    qs:
      {
        'start_date.keyword': 'this_month',
        // 'start_date.range_start': '2017-11-27T19:00:00',
        // 'start_date.range_end': '2017-12-30T19:00:00',
        'location.address': 'san francisco',
        categories: '103,110,113,116,17001,104,105,102,118,108,109',
        page: 1,
      },
    headers:
    { authorization: API_key },
  };

  const getCalls = () => new Promise((resolve, reject) => {
    request(month_options, (error, response, body) => {
      const page = JSON.parse(body).pagination.page_number;
      const parsedEvents = JSON.parse(body).events;
      if (!error) {
        holder = holder.concat(parsedEvents);
        if (page < 5) {
          month_options.qs.page += 1;
          resolve(getCalls());
        } else {
          resolve(holder);
        }
      } else {
        console.log(error);
        reject(error);
      }
    });
  });

  getCalls()
    .then((holder) => {
      console.log(holder.length);
      return holder.map((event) => {
        const imageUrl = event.logo ? event.logo.url : 'https://cdn.evbstatic.com/s3-build/perm_001/f8c5fa/django/images/discovery/default_logos/4.png';
        const catID = event.subcategory_id === 17001 ? event.subcategory_id : event.category_id;
        const defaultPrice = event.is_free ? 'free' : 'paid';
        const eventName = `$$${event.name.text}$$`;
        const eventDesc = `$$${event.description.text}$$`;
        return {
          id: event.id,
          name: eventName,
          description: eventDesc,
          venue_id: event.venue_id,
          price: defaultPrice,
          url: event.url,
          image_url: imageUrl,
          start_datetime: event.start.local,
          end_datetime: event.end.local,
          category_id: catID,
          day: moment(event.start.local).format('dddd'),
        };
      });
    })
    .then((formattedEvents) => {
      // ADD TO DB
      db.addEvents(formattedEvents)
        .then((results) => {
          // //GET TODAYS EVENTS FROM THE DB
          db.getTodaysEvents()
            .then((data) => {
              responseObj.today = data.rows;
              res.json(responseObj);
            });
        });
    })
    .then(() => {
      app.get('/weekend', (req, res) => {
        getEvents.weekend()
          .then((data) => {
            res.json(data);
          });
      });
    });
});

// ======================================================================
//                    Query the DB on client filters
// ======================================================================
app.post('/filter', (req, res) => {
  const date = req.body.date;
  const categories = req.body.category;
  const price = req.body.price;

  db.searchAllEvents(date, categories, price)
    .then((data) => {
      res.json(data);
    });
});


// ======================================================================
//                    Send today's data back to the client
// ======================================================================
app.get('/loadToday', (req, res) => {
  getEvents.today()
    .then((data) => {
      res.json(data);
    });
  // getTodayEventsDB
});
// ======================================================================
//                    load Venues to DB
// ======================================================================
app.get('/loadVenues', (req, res) => {
  getEvents.month()
    .then((data) => {
      res.json(data);
    });
});

// ======================================================================
//                    Run Server
// ======================================================================

module.exports = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});
