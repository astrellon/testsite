/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , errorHandler = require('errorhandler')
  , http = require('http')
  , mongoItems = require('./routes/items')
  , sass = require('node-sass');

var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server); // this tells socket.io to use our express server


io.on('connection', function(socket) {
    mongoItems.socketConnect(io, socket);
    function bindSocket(callback) {
        return function(data) {
            callback(io, socket, data);
        }
    }

    socket.on('addItem', bindSocket(mongoItems.socketAdd));
});

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
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

app.get('/items', mongoItems.findAll);
app.get('/items/:id', mongoItems.findById);
app.post('/items', mongoItems.addItem);
app.put('/items/:id', mongoItems.updateItem);
app.delete('/items/:id', mongoItems.deleteItem);
app.get('/drop', mongoItems.deleteAll);

console.log("Express server listening on port 3000");
