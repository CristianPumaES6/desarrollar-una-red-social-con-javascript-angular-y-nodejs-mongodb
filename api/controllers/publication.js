'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow')

function probando(req, res) {
    res.status(200).send({
        message: "Hola desde el CONTROLADOR DE PUBLICACIONES"
    });
}

function savePublication(req, res) {
    var params = req.body;

    var publication = new Publication();

    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto!!' });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar la publicacion.' });

        if (!publicationStored) return res.status(404).send({ message: 'La publicacion No ha sido guardad.' });

        return res.status(200).send({ publication: publicationStored });
    })
}


//retorna las publicaciones de los usuarios que yo sigo.
function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error devolver el seguimiento.' });

        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);


        //operador $in busca adentro de un array las concidencias, busca todo los documento cuyo usuario este dentro del contenido de array y lo sacara.
        Publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {

            if (err) return res.status(500).send({ message: 'Error devolver publicaciones.' });
            if (!publications) return res.status(404).send({ message: 'No hay publicaciones.' });

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page,
                items_per_page: itemsPerPage,
                publications
            })

        });
    });
}

function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error devolver publicacion' });
        if (!publication) return res.status(404).send({ message: 'No existe la publicacion.' });
        return res.status(200).send({ publication });
    });
}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({ 'user': req.user.sub, '_id': publicationId }).remove(err => {

        if (err) return res.status(500).send({ message: 'Error eliminar publicacion.' });
        return res.status(200).send({ message: 'Publicacion eliminada correctamente.' });

    });
}

//Subir imagenes
function uploadImage(req, res) {

    var publicationId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;

        //convertimos path en arreglo para gaurdar solo el nombre
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];// Obtenemos la extension del arreglo.


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //actualizar documento de publicacion.
            Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, publicationUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticio updateUser()', err });
                if (!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar la publicacion.' });

                return res.status(200).send({ user: publicationUpdated });
            })

        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no valida.');
        }
    }
}



function getImageFile(req, res) {
    var imageFile = req.params.imageFile;

    var path_file = './uploads/publications/' + imageFile;

    console.log(path_file)

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    })
}

//retornar una publicacion decuerdo a su ID.

module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile

}