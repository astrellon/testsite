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
  , mongoItems = require('./routes/items')
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

app.get('/', routes.index);

app.get('/items', mongoItems.urlFindAll);
app.get('/items/:id', mongoItems.urlFindById);
app.post('/items', mongoItems.urlAddItem);
app.put('/items/:id', mongoItems.urlUpdateItem);
app.delete('/items/:id', mongoItems.urlDeleteItem);
app.delete('/items', mongoItems.urlDeleteAll);

console.log("Express server listening on port 3000");
