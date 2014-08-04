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
  , jade_browser = require('jade-browser')
  , sass = require('node-sass');

var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server); // this tells socket.io to use our express server

mongoItems.setIo(io);

io.set('browser client minifcation', true);
io.set('browser client etag', true);
io.on('connection', function(socket) {
    mongoItems.socketConnect(socket);
    function bindSocket(callback) {
        return function(data) {
            callback(socket, data);
        }
    }

    socket.on('addItem', bindSocket(mongoItems.socketAdd));
    socket.on('removeItem', bindSocket(mongoItems.socketDelete));
    socket.on('updateItem', bindSocket(mongoItems.socketUpdate));
});

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

app.get('/items', mongoItems.findAll);
app.get('/items/:id', mongoItems.findById);
app.post('/items', mongoItems.addItem);
app.put('/items/:id', mongoItems.updateItem);
app.delete('/items/:id', mongoItems.deleteItem);
app.get('/drop', mongoItems.deleteAll);

console.log("Express server listening on port 3000");
