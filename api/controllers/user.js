'user strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

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

        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send(
                {
                    user,
                    "following": value.following,
                    "followed": value.followed
                });
        });

    })

}

async function followThisUser(identity_user_id, user_Id) {

    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_Id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.findOne({ "user": user_Id, "followed": identity_user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    };

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

        followUserIds(identity_user_id).then((value) => {

            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });

        });
    });
}

async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec().then((follows) => {

        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        return follows_clean;

    }).catch((err) => {
        return handleError(err);
    });


    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec().then((follows) => {

        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });
        return follows_clean;

    }).catch((err) => {
        return handleError(err);
    });

    return {
        following,
        followed
    }
}

function getCounters(req, res) {

    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }

    getCountFollow(userId).then((value) => {
        return res.status(200).send(value)
    })

}

async function getCountFollow(user_id) {
    var following = await Follow.count({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.count({ "followed": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    var publications = await Publication.count({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });


    return {
        following,
        followed,
        publications
    }

}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    console.log('-----------');
    console.log(update.password);
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'no tienes permiso para actualizar.' });

    }

    User.find({
        $or: [
            { email: update.email },
            { nick: update.nick }
        ]
    }).exec((err, users) => {

        var user_isset = false;
        users.forEach((user) => {
            if (user && user._id != userId) user_isset = true;
        })

        if (user_isset) {
            return res.status(404).send({ message: 'Los datos ya estan en uso.' });
        }
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {

            if (err) return res.status(500).send({ message: 'Error en la peticio updateUser()' });
            if (!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });

            return res.status(200).send({ user: userUpdate });

        });
    })



}

function uploadImage(req, res) {

    var userId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;

        //convertimos path en arreglo para gaurdar solo el nombre
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];// Obtenemos la extension del arreglo.



        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'no tienes permiso para actualizar los datos .');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //actualizar documento de usuario logeado.
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdate) => {
                if (err) return res.status(500).send({ message: 'Error en la peticio updateUser()' });
                if (!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });

                return res.status(200).send({ user: userUpdate });
            })

        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no valida.');
        }
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;

    var path_file = './uploads/users/' + imageFile;

    console.log(path_file)

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
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
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
};