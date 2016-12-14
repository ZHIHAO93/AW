"use strict";
var express = require('express');
var router = express.Router();
var ModeloJugador = require('../models/ModeloJugador');
var ModeloPartida = require('../models/ModeloPartida');

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/perfil');
  },
  filename: function (req, file, cb) {
    cb(null, req.body.Nick + '-' + file.fieldname + '-' + Date.now() + ".jpg");
  }
});

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res) {
    if(req.session.jugador){
        res.redirect('/jugador/' + req.session.jugador.Nick);
    } else {
        res.render('index', { jugador: "", error: null});
    }
});

router.get('/:Nick', function (req, res) {
    if(req.session.jugador) {
        var jugador = new ModeloJugador(req.session.jugador);
        var partida = new ModeloPartida("undefined");
        partida.readAll(req.session.jugador.Nick, function(err, rowPartida) {
            if(err) {
                console.error(err.message);
                res.render('welcome', { jugador: jugador, partida: rowPartida, error: [err.message]});
            } else {
                res.render('welcome', { jugador: jugador, partida: rowPartida, error: null });
            }
        });
    } else {
        res.redirect('/');
    }
});

router.post('/login', function(req, res) {
    var jugador = new ModeloJugador(req.body);
    // Comprobar si existe jugador
    jugador.read(function(err, listJugador) {
        if(err) {
            console.error(err.message);
            res.cookie("error", err.message);
            res.redirect('/');
        } else {
            if(listJugador.length === 0) {
                console.log("No existe el jugador con Nick: " + req.body.Nick);
                res.cookie("error", 'No existe el jugador con Nick: ' + req.body.Nick);
                res.redirect('/');
            } else {
                if(!jugador.checkPassword(listJugador[0].Password)){
                    console.log("Contraseña incorrecta!");
                    res.cookie("error", 'Contraseña incorrecta!');
                    res.redirect('/');
                } else {
                    console.log("Identificado!");
                    req.session.jugador = listJugador[0];
                    res.redirect('/jugador/' + req.session.jugador.Nick);
                }
            }
        }
    });
});

router.post('/reg', upload.single('Foto'), function(req, res) {
    if(req.file){
        req.body.Foto = './perfil/' + req.file.filename;
    } else {
        req.body.Foto = "";
    }
    var jugador = new ModeloJugador(req.body);
    jugador.read(function(err, listJugador) {
        if(err) {
            console.error(err.message);
        } else {
            if(listJugador.length > 0) {
                console.log("Ya existe jugador con Nick: " + jugador.Nick);
                res.redirect('/');
            } else {
                console.log("No existe jugador con Nick: " + jugador.Nick + ", Registrar!");
                jugador.create(function(err, newRow) {
                    if(err) {
                        console.error(err.message);
                    } else {
                        console.log("El registro correcto!");
                        console.log(newRow);
                        req.session.jugador = jugador;
                        res.redirect('/jugador/' + jugador.Nick);
                    }
                });
            }
        }
    });
});

module.exports = router;