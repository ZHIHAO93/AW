var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('saboteur:server');
var session = require('express-session');
var mysqlSession = require('express-mysql-session');
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "saboteur"
});
var middlewareSession = session({
    saveUninitialized: false,
    secret: "Saboteur_secret",
    resave: false,
    store: sessionStore
});

var index = require('./routes/index');
var jugador = require('./routes/Jugador');
var partida = require('./routes/Partida');
var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(middlewareSession);

app.use('/', index);
app.use('/jugador', jugador);
app.use('/', partida);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { jugador: req.cookies.jugador, error: null, errorStatus: res.status, errorStack: res.locals.error.status});
});

app.listen(config.port, function() {
  console.log('Express server listening on port ' + config.port);
});

module.exports = app;