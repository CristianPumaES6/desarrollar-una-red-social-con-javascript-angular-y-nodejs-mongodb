'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'clave_secreta_desarrollar_web_con_angular';


exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no tiene la cabecera de authenticacion.' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');//expresiones regulares.

    try {

        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) return res.status(401).send({ message: 'El token a expirado.' });

    } catch (ex) {
        return res.status(404).send({ message: 'El token no es valido.' });
    }

    req.user = payload;

    next();


}