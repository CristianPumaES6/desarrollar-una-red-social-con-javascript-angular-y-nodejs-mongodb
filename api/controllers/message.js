'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res) {
    res.status(200).send({ message: 'HOLA QUE TAL ?' });
}

//Guardar mensaje.
function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) return res.status(200).send({ message: 'Enviar los datos necesarios.' });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.create_at = moment().unix();

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({ message: 'Error en la petición.' });
        if (!messageStored) return res.status(500).send({ message: 'Error en la petición.' });

        return res.status(200).send({ message: messageStored });
    });
}

//listar mensajes recividos
function getReceivedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ receiver: userId }).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la petición.' });
        if (!messages) return res.status(404).send({ message: 'no hay mensajes.' });

        return res.status(200).send({
            total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        });

    });
}

//Listar mensajes Emitidos
function getEmitterMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ emitter: userId }).populate('emitter receiver', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la petición.' });
        if (!messages) return res.status(404).send({ message: 'no hay mensajes.' });

        return res.status(200).send({
            total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        });

    });
}

module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmitterMessages
}