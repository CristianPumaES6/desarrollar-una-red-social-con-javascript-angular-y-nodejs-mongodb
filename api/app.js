'use string'

var express = require("express");
var bodyParser = require('body-parser');


var app = express();


//cargar rutas
var user_routes = require('./routes/user')
var follow_routes = require('./routes/follow')
var publication_routes = require('./routes/publication')
var message_routes = require('./routes/message')

//--------- Middlewares -------------
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//cors

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);


//exportar
module.exports = app;
