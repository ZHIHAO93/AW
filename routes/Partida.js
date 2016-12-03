var express = require('express');
var router = express.Router();
var ModeloPartida = require('../models/ModeloPartida');
var ModeloParticipacion = require('../models/ModeloParticipa');
var ModeloCarta = require('../models/ModeloCartas');

router.get('/crearPartida', function(req, res, next) {
    res.render('createGame', { jugador: req.session.jugador });
});

router.post('/crearPartida', function(req, res, next) {
    var partida = new ModeloPartida(req.body);
    partida.read(function(err, arrPartida){
            if(err){
                    console.error(err.message);
                    res.redirect('/crearPartida');
            } else {
                    if(arrPartida.length > 0){
                            console.log('Ya existe partida con nombre ' + partida.Nombre);
                            res.redirect('/crearPartida');
                    } else {
                            console.log('No existe partida: ' + partida.Nombre + ', crear nueva partida!');
                            partida.Creador = req.session.jugador.Nick;
                            partida.create(function(err, rowPartida) {
                                if(err) {
                                    console.error(err.message);
                                    res.redirect('/crearPartida');
                                } else {
                                    console.log("Nueva partida creada");
                                    res.redirect('/jugador/' + partida.Creador);
                                }
                            });
                    }
            }
    });
});

router.get('/unirPartida', function(req, res) {
    var partida = new ModeloPartida("undefined");
    partida.readAbiertas(function(err, rowPartida){
            if(err){
                    console.error(err.message);
                    res.redirect('/jugador/' + req.session.jugador.Nick);
            } else {
                    res.render('unirPartida', { jugador: req.session.jugador, partida: rowPartida });
            }
    });
});

router.get('/unir/:partida', function(req, res) {
    var partida = new ModeloPartida("undefined");
    var participacion = {
        Jugador: req.session.jugador.Nick,
        Role: "",
        Partida: req.params.partida
    };
    var participa = new ModeloParticipacion(participacion);
    participa.unir(function(err, rowParticipa) {
        if(err) {
            console.error("Error en unir partida" + err.message);
            res.redirect('/unirPartida');
        } else {
            console.log("El jugador " + participacion.Jugador + " ha unido a la partida " + participacion.Partida);
            partida.Nombre = req.params.partida;
            partida.read(function(err, rowPartida) {
                if(err) {
                    console.error("Error en leer partida" + err.message);
                    res.redirect('/unirPartida');
                } else {
                    participa.participantes(function(err, jugadores) {
                        if (err){
                            console.error("Error en comprobar el numero de jugadores despues de unir un nuevo jugador");
                            console.error(err.message);
                            res.redirect('/unirPartida');
                        } else {
                            if(jugadores.length === rowPartida[0].Max_jugadores) {
                                console.log("La partida ha unido el maximo numero de jugadores, inicial la partida");
                                res.redirect('/cerrar/' + rowPartida[0].Nombre);
                            } else {
                                res.redirect('/unirPartida');
                            }
                        }
                    });
                }
            });
        }
    });
});

router.get('/cerrar/:partida', function(req, res) {
    var p = new ModeloPartida("undefined");
    p.Nombre = req.params.partida;
    p.read(function(err, result) {
        if(err) {
            console.error("Erro en comprobacion de partida cuando cierra la partida");
            console.error(err.message);
            res.redirect('/jugador/' + req.session.jugador.Nick);
        } else {
            var partida = new ModeloPartida(result[0]);
            var participa = new ModeloParticipacion("undefined");
            participa.Partida = p.Nombre;
            partida.Max_turno = result[0].Max_turno;
            
            participa.participantes(function(err, jugadores) {
                if(err) {
                    console.error("Error cuando cierra la partida: " + err.message);
                    //res.redirect('/jugador/' + req.session.jugador.Nick);
                } else {
                    var numJugador = Math.floor(Math.random() * jugadores.length);
                    partida.Estado = "Activa";
                    partida.Turno = jugadores[numJugador].Jugador;
                    partida.update(function(err, result) {
                        if(err) {
                            console.error("Error en cerrar el partido" + err.message);
                            res.redirect('/jugador/' + req.session.jugador.Nick);
                        } else {
                            var saboteadores = [];
                            var numSaboteador;
                            if(partida.Max_jugadores === 3 || partida.Max_jugadores === 4){
                                numSaboteador = Math.floor(Math.random() * jugadores.length);
                                saboteadores.push(jugadores[numSaboteador].Jugador);
                            } else {
                                numSaboteador = Math.floor(Math.random() * jugadores.length);
                                saboteadores.push(jugadores[numSaboteador].Jugador);
                                numSaboteador = Math.floor(Math.random() * jugadores.length);
                                saboteadores.push(jugadores[numSaboteador].Jugador);
                            }
                            participa.asignarRole(saboteadores, function(err, result) {
                                if(err) {
                                    console.error("Error en asignar role " + err.message);
                                } else {
                                    console.log("Comienza la partida " + req.params.partida);
                                    res.redirect('/jugador/' + req.session.jugador.Nick);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/partida/:nombre', function(req, res) {
    var partida = new ModeloPartida("undefined");
    partida.Nombre = req.params.nombre;
    partida.read(function(err, rowPartida) {
        if(err) {
            console.error("Error en abrir partida:" + req.params.nombre);
            console.error("Con error: " + err.message);
            res.redirect('/jugador/' + req.session.jugador.Nick);
        } else {
            if(rowPartida.length > 0) {
                var participacion = new ModeloParticipacion("undefined");
                participacion.Partida = partida.Nombre;
                participacion.participantes(function(err, jugadores) {
                    if(err){
                        console.error("Error en leer los participantes");
                        console.error("Con error: " + err.message);
                        res.redirect('/jugador/' + req.session.jugador.Nick);
                    } else {
                        rowPartida[0].Participantes = "";
                        jugadores.forEach(function(jugador, index, array){
                            rowPartida[0].Participantes += "," + jugador.Jugador;
                            if(index === array.length - 1){
                                
                                
                                res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], numJugadores: jugadores.length } );
                            }
                        });
                    }
                });
            } else {
                res.redirect('/jugador/' + req.session.jugador.Nick);
            }
        }
    });
});

module.exports = router;