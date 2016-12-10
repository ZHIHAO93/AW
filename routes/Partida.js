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
                console.log(rowPartida);
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
    partida.readActivas(req.params.nombre, function(err, rowPartida) {
        if(err) {
            console.error("Error en leer partida " + req.params.nombre + ": " + err.message);
            res.redirect('/jugador/' + req.session.jugador.Nick);
        } else {
            var nCarta = 0;
            if(rowPartida[0].numJugadores <= 5) {
                nCarta = 6;
            } else {
                nCarta = 5;
            }
            var carta = new ModeloCarta({Propietario: req.session.jugador.Nick, Partida: req.params.nombre});
            carta.readTabla(function(err, cartaTabla) {
                if(err) {
                    console.error("Error en leer las cartas de la tabla: " + err.message);
                } else {
                    carta.readCartasMano(function(err, rowCartas) {
                        if(err) {
                            console.error("Error en consulta cartas en la mano: " + err.message);
                        } else {
                            if(rowCartas.length === 0){
                                carta.repartirCarta(nCarta, function(err, newCartas) {
                                    if(err){
                                        console.error("Error en repartir cartas: " + err.message);
                                    } else {
                                        res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: newCartas, cartasTabla: cartaTabla });
                                    }
                                });
                            } else {
                                res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: rowCartas, cartasTabla: cartaTabla } );
                            }
                        }
                    });
                }
            });
        }
    });
});

router.get('/partida/:nombre/:carta', function(req, res) {
    console.log("seleccionar la carta " + req.params.carta);
    res.cookie("cartaSeleccionada", req.params.carta);
    res.redirect('/partida/' + req.params.nombre);
});

router.get('/partida/:nombre/casilla/:filaColumna', function(req, res) {
    var filaYcolumna = req.params.filaColumna;
    var casilla = filaYcolumna.split('y');
    if(req.cookies.cartaSeleccionada){
        var carta = new ModeloCarta({ Fila: casilla[0], Columna: casilla[1], Propietario: req.session.jugador.Nick, Partida: req.params.nombre, Path: req.cookies.cartaSeleccionada });
        carta.readTabla(function(err, tabla) {
            if(err) {
                console.error("Error en leer tabla " + err.message);
            } else {
                if(tabla.length > 0) {
                    var arriba = [1, 3, 5, 7, 9,11, 13, 15];
                    var derecha = [8, 9, 10, 11, 12, 13, 14, 15];
                    var abajo = [5, 6, 7, 12, 13, 14, 15];
                    var izquierda = [2, 3, 6, 7, 10, 11, 14, 15];
                    var filaCarta = parseInt(carta.Fila), colCarta = parseInt(carta.Columna);
                    var correcto = true;
                    tabla.forEach(function(obj, index, array){
                            var p = parseInt(carta.Path);
                            if(obj.Fila === filaCarta - 1 && obj.Columna === colCarta) { 
                                if(arriba.indexOf(parseInt(obj.Path)) > -1 && abajo.indexOf(p) === -1){
                                // arriba
                                    console.error("arriba");
                                    correcto = false;
                                } else if(arriba.indexOf(parseInt(obj.Path)) === -1 && abajo.indexOf(p) > -1) {
                                    console.error("arriba");
                                    correcto = false;
                                }
                            }
                            if(obj.Fila === filaCarta && obj.Columna === colCarta + 1){
                                if(derecha.indexOf(parseInt(obj.Path)) > -1 && izquierda.indexOf(p) === -1){
                                // derecha
                                    console.error("derecha");
                                    correcto = false;
                                } else if(derecha.indexOf(parseInt(obj.Path)) === -1 && izquierda.indexOf(p) > -1) {
                                    console.error("derecha");
                                    correcto = false;
                                }
                            }
                            if(obj.Fila === filaCarta + 1 && obj.Columna === colCarta){
                                if(abajo.indexOf(parseInt(obj.Path)) > -1 && arriba.indexOf(p) === -1){
                                    // abajo
                                    console.error("abajo1");
                                    correcto = false;
                                } else if(abajo.indexOf(parseInt(obj.Path)) === -1 && arriba.indexOf(p) > -1) {
                                    console.error("abajo2");
                                    correcto = false;
                                }
                            }
                            
                            if(obj.Fila === filaCarta && obj.Columna === colCarta - 1){
                                if(izquierda.indexOf(parseInt(obj.Path)) > -1 && derecha.indexOf(p) === -1){
                                // izquierda
                                    console.error("izquierda");
                                    correcto = false;
                                } else if(izquierda.indexOf(parseInt(obj.Path)) === -1 && derecha.indexOf(p) > -1) {
                                    console.error("izquierda");
                                    correcto = false;
                                }
                            }
                            
                        if (index === array.length - 1) {
                            if(correcto){
                                carta.ponerCarta(function(err, result) {
                                    if(err) {
                                        console.error("Error en poner carta al casila: " + err.message);
                                    } else {
                                        res.clearCookie("cartaSeleccionada");
                                        carta.repartirCarta(1, function(err, result) {
                                            if(err) {
                                                console.error("Error en repartir carta despues de poner carta a la tabla: " + err.message);
                                            } else {
                                                res.redirect('/partida/' + req.params.nombre);
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.redirect('/partida/' + req.params.nombre);
                            }
                        }
                    });
                } else {
                    carta.ponerCarta(function(err, result) {
                        if(err) {
                            console.error("Error en poner carta al casila: " + err.message);
                        } else {
                            res.clearCookie("cartaSeleccionada");
                            carta.repartirCarta(1, function(err, result) {
                                if(err) {
                                    console.error("Error en repartir carta despues de poner carta a la tabla: " + err.message);
                                } else {
                                    res.redirect('/partida/' + req.params.nombre);
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        res.redirect('/partida/' + req.params.nombre);
    }
});

module.exports = router;