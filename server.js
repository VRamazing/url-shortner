'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var MongoClient = mongo.MongoClient;
var config = require('./config');
var cors = require('cors');
var Url = require('./url.models.js');
var bodyParser = require('body-parser');

var dbOptions = { useMongoClient: true }; 

mongoose.Promise = global.Promise;

var dbUrl = config.dbUrl;

var app = express();

app.use(cors());

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/seedData', function(req, res){
  mongoose.connect(dbUrl, dbOptions);

  var urls = [
    new Url({
      name: 'https://www.google.com',
      uuid: 1
    }),
    new Url({
      name: 'https://www.facebook.com',
      uuid: 2
    }),
  ];
  var done=0;
  for (var i=0; i< urls.length; i++){
    urls[i].save(function(err, result){
      done++;
      if(done === urls.length){
        mongoose.disconnect();
        res.send('Seeding successful. Disconnecting...');
      }  
    });
  }
})

app.post("/api/shorturl/new", function (req, res) {
  // get url from post body req.body.url
  // Store it in monogodb with inc index
  // Return the updated url
  mongoose.connect(dbUrl, dbOptions);
  
  Url.count({
    name: req.body.url
  }, function(err, count){
    if(err){
      console.log(err);
    }
    if(count === 0){
      Url.count({}, function(err, count){
        if(err){
          console.log(err);
        }
        let urlJson = {
          name: req.body.url,
          uuid: count + 1
        }
        let url = new Url(urlJson)
    
        url.save(function(err){
          if(err){
            console.log(err);
          }
          res.json(urlJson);
          mongoose.disconnect();    
        });
      }) 
    }
    else{
      Url.findOne({name: req.body.url}, function(err, data){
        res.json({
          name: data.name,
          uuid: data.uuid
        })
      })
    }
  })

   
});


app.get("/api/shorturl/all", function (req, res) {
  mongoose.connect(dbUrl, dbOptions);
  var query = Url.find({},{'_id': false})
  query.select('name uuid');
  query.exec(function(err, docs){
    if(err){
      console.log(err)
    }
    res.status(200);
    res.json(docs);
    mongoose.disconnect();
  })  
});

app.get("/api/shorturl/clear-data", function (req, res) {
  mongoose.connect(dbUrl, dbOptions);
  Url.deleteMany({}, function (err) {
    if(err){
      console.log(err)
    }
    res.json('Successfully deleted all data');
    mongoose.disconnect();
  })
});

app.get("/api/shorturl/:id", function (req, res) {
  mongoose.connect(dbUrl, dbOptions);
  
  var query = Url.findOne({ 'uuid': req.params.id});
  query.select('name');  
  query.exec(function (err, url) {
    if (err){
      res.send({"error":"invalid URL"});
    }
    res.send(`<script>window.location.href='${url.name}';</script>`);
    mongoose.disconnect();
  })
});


//Need a 404, 505 error page. 
app.get('/404', function(req, res, next){
  res.status(404);
  next();
});

app.use(function(req, res, next){
  res.status(404);
  res.json({ error: 'Not found' })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});