var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var sessions = require('./routes/sessions');
var dashboard = require('./routes/dashboard');
var spaces = require('./routes/spaces');

var assembla = require('./libs/assembla');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('123-321-111-222-333'));
app.use(session({ secret: 'some-random-12345-54321-string' }));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/bower_components')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
   res.locals.title = 'Mana';

   if(req.session && req.session.is_valid){
       res.locals.user = req.session.user;
       res.locals.is_valid = true;
   }else{
       res.locals.is_valid = false;
   }

   if(req.session.notification){
       res.locals.notification = req.session.notification;
       req.session.notification = null;
   }

    next();
});

app.use(function(req, res, next){
   if(req.session && req.session.is_valid){
        assembla.getSpaces(req.session.user.api_key, req.session.user.api_secret, function(spaces){
            res.locals.spaces = spaces;
            next();
        });
   }else{
       next();
   }
});

var ensure_login = function(req, res, next){
    if(req.session && req.session.is_valid)return next();

    return res.redirect('/');
}

app.all('/users*', ensure_login);
app.all('/dashboard*', ensure_login);
app.all('/spaces*', ensure_login);
app.all('/calendar', ensure_login);
app.all('/authorize', ensure_login);


app.use('/', routes);
app.use('/users', users);
app.use('/sessions', sessions);
app.use('/dashboard', dashboard);
app.use('/spaces', spaces);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
