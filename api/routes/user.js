'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth= require('../middlewares/authenticated');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/pruebas',md_auth.ensureAuth, UserController.prueba);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);

module.exports = api;