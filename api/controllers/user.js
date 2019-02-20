'user strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var jwt = require('../services/jwt');

//home.
function home(req, res) {
    res.status(200).send({
        message: 'Hola '
    });
}

//registrar un usuario
function saveUser(req, res) {
    var params = req.body;
    var user = new User();
    console.log(params);

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

//Iniciar session.
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

                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {

                        //devolver datos de usuario
                        user.password = undefined;
                        res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'el usuario no se a podido logear correctamente.' });
                }
            });

        } else {
            return res.status(404).send({ message: 'el usuario no se a podido logear correctamente!!.' });
        }

    })
}

//conseguir datos de un usuario
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {

        if (err) return res.status(500).send({ message: 'Error en la peticio getUser()' });

        if (!user) return res.status(404).send({ message: 'El usuario no existe.' });

        return res.status(200).send({ user });

    })

}

//Conseguir datos de un usuario
function getUsers(req, res) {

    //obtenemos el dato del JWt
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {

        if (err) return res.status(500).send({ message: 'Error en la peticio getUsers()' });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles.' });


        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    })

}


//para la prueba de seguridad con login
function prueba(req, res) {
    res.status(200).send({
        message: 'Ser el mejor.'
    });
}
module.exports = {
    home,
    saveUser,
    loginUser,
    prueba,
    getUser,
    getUsers
};