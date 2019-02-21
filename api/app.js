'use string'

var express = require("express");
var bodyParser = require('body-parser');


var app = express();


//cargar rutas
var user_routes = require('./routes/user')
var follow_routes = require('./routes/follow')

//--------- Middlewares -------------
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//cors

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);


//exportar
module.exports = app;
