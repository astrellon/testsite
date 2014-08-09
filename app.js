/**
 * Module dependencies.
 */

var express = require('express')
  , compression = require('compression')
  , routes = require('./routes')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , errorHandler = require('errorhandler')
  , http = require('http')
  , mongoServer = require('./routes/mongo/server')
  , mongoCollection = require('./routes/mongo/collection')
  , sass = require('node-sass');

var app = express();
var server = app.listen(3000);

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  app.use(compression({
      threshold: 512
  }));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(morgan('combined'));
  app.use(bodyParser.json());

  app.use(
      sass.middleware({
        src: __dirname + '/sass',
        dest: __dirname + '/public/stylesheets',
        prefix: '/stylesheets',
        debug: true
      })
  );
  app.use(express.static(__dirname + '/public'));
  app.use(errorHandler());
}


var appDb = mongoServer.getDb('localhost', 27017, 'testdb');
var appItems = mongoCollection.getCollection('items', appDb);
var appUsers = mongoCollection.getCollection('users', appDb);
routes.setItemCollection(appItems);

app.get('/', routes.index);

appDb.open(function(err, db) {
    if (err) {
        console.error('Unable to connect to mongodb database');
        return;
    }
    appItems.addUrlsToApp(app, '/items');
    appUsers.addUrlsToApp(app, '/users');
});

console.log("Express server listening on port 3000");
