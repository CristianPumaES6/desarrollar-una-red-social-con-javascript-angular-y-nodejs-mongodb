'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');// ver el momento exacto.
var secret = 'clave_secreta_desarrollar_web_con_angular';

//moment().unix() formato unix.
exports.createToken = function (user) {

    //Todo esto se encriptara en un token.
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    }

    return jwt.encode(payload, secret);

};