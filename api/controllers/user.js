'user strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

function home(req, res) {
    res.status(200).send({
        message: 'Hola '
    });
}

function saveUser(req, res) {
    var params = req.body;
    var user = new User();


    if (params.name && params.surname && params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick.toLowerCase();
        user.email = params.email.toLowerCase();
        user.role = 'ROLE_USER';
        user.image = null;

        //controlamos los usuarios duplicados
        User.find({
            $or: [
                { email: user.email },
                { nick: user.nick }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuariosduplicados.' });
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'Error usuario duplicado.' });

            } else {
                //encriptamos el spasword y guardamos alnuevo usuario 



                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStore) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error al guardar usuario' });
                        }
                        if (userStore) {
                            res.status(200).send({ user: userStore });
                        } else {
                            return res.status(404).send({ message: 'No se ha registrado el usuario.' });
                        }
                    })
                });

            }
        })


    } else {

        res.status(200).send({
            message: 'Enviar todos los datos completos!!'
        });

    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({
        email: email
    }, (err, user) => {

        if (err) return res.status(500).send({ message: 'Error en la peticion de loginUser.' });
        if (user) {
            
            bcrypt.compare(password, user.password, function (err, check) {
                if (check) {
                    //devolver datos de usuario
                    res.status(200).send({ user });
                } else {
                    return res.status(404).send({ message: 'el usuario no se a podido logear correctamente.' });
                }
            });

        } else {
            return res.status(404).send({ message: 'el usuario no se a podido logear correctamente!!.' });
        }
        
    })
}
module.exports = {
    home,
    saveUser,
    loginUser
};