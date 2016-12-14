var express = require('express');
var router = express.Router();
var ModeloPartida = require('../models/ModeloPartida');
var ModeloParticipacion = require('../models/ModeloParticipa');
var ModeloCarta = require('../models/ModeloCartas');

router.get('/crearPartida', function(req, res, next) {
    if(req.cookies.error){
        var error = [];
        error.push(req.cookies.error);
        res.clearCookie("error");
        res.render('createGame', { jugador: req.session.jugador, error: error } );
    } else {
        res.render('createGame', { jugador: req.session.jugador, error: null });
    }
});

router.post('/crearPartida', function(req, res, next) {
    var partida = new ModeloPartida(req.body);
    partida.read(function(err, arrPartida){
            if(err){
                    console.error(err.message);
                    res.cookie("error", err.message);
                    res.redirect('/crearPartida');
            } else {
                    if(arrPartida.length > 0){
                            console.error('Ya existe partida con nombre ' + partida.Nombre);
                            res.cookie("error", 'Ya existe partida con nombre ' + partida.Nombre);
                            res.redirect('/crearPartida');
                    } else {
                            console.log('No existe partida: ' + partida.Nombre + ', crear nueva partida!');
                            partida.Creador = req.session.jugador.Nick;
                            partida.create(function(err, rowPartida) {
                                if(err) {
                                    console.error(err.message);
                                    res.cookie("error", err.message);
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
                    res.cookie("error", 'err.message');
                    res.redirect('/jugador/' + req.session.jugador.Nick);
            } else {
                    res.render('unirPartida', { jugador: req.session.jugador, partida: rowPartida, error: null});
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
                    var oros = [1, 3, 5];
                    partida.PosOro = 0;
                    while(oros.indexOf(partida.PosOro) === -1){
                        partida.PosOro = Math.floor(Math.random() * 5);
                    }
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
                                    console.log("Asignado todos los roles");
                                    var carta = new ModeloCarta({Partida: req.params.partida});
                                    carta.ponerCartasIniciales(function(err, result) {
                                        if(err) {
                                            console.error("Error en poner cartas iniciales: " + err.message);
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
        }
    });
});

router.get('/partida/:nombre', function(req, res) {
    var partida = new ModeloPartida("undefined");
    partida.readActivas(req.params.nombre, function(err, rowPartida) {
        if(err) {
            console.error("Error en leer partida " + req.params.nombre + ": " + err.message);
            res.cookie("error",'Error en leer partida ' + req.params.nombre + ": " + err.message);
            res.redirect('/jugador/' + req.session.jugador.Nick);
        } else if(rowPartida.length === 0) {
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
                                carta.repartirCarta(nCarta, [], function(err, newCartas) {
                                    if(err){
                                        console.error("Error en repartir cartas: " + err.message);
                                    } else {
                                        if(req.cookies.error){
                                            var error = [req.cookies.error];
                                            res.clearCookie("error");
                                            res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: newCartas, cartasTabla: cartaTabla, error: error });
                                        } else {
                                            res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: newCartas, cartasTabla: cartaTabla, error: null });
                                        }
                                    }
                                });
                            } else {
                                if(req.cookies.error) {
                                    var error = [req.cookies.error];
                                    res.clearCookie("error");
                                    res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: rowCartas, cartasTabla: cartaTabla, error: error } );
                                } else {
                                    res.render('Partida', { jugador: req.session.jugador, partida: rowPartida[0], nCarta: nCarta, cartas: rowCartas, cartasTabla: cartaTabla, error: null } );
                                }
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

router.get('/partida/:nombre/cambiar/:carta', function(req, res) {
    console.log("cambiar la carta " + req.params.carta);
    var carta = new ModeloCarta({ Propietario: req.session.jugador.Nick, Partida: req.params.nombre, Path: req.params.carta });
    carta.eliminarCarta(function(err, result) {
        if(err) {
            console.error("Error en cambiar carta");
            res.cookie("error", "Error en cambiar carta: " + err.message);
        } else {
            carta.readCartasMano(function(err, cartasEnMano) {
                if(err) {
                    console.error("Error en leer carta en mano despues de poner carta a la tabla: " + err.message);
                } else {
                    carta.repartirCarta(1, cartasEnMano, function(err, result) {
                        if(err) {
                            console.error("Error en repartir carta despues de poner carta a la tabla: " + err.message);
                        } else {
                            var partida = new ModeloPartida("undefined");
                            partida.readActivas(req.params.nombre, function(err, rowPartida) {
                                if(err) {
                                    console.error("Error en leer partida despues de repartir nueva carta: " + err.message);
                                } else if(rowPartida.length === 0) {
                                    console.error("No encuentra la partida");
                                } else {
                                    var participantes = rowPartida[0].Participantes.split(',');
                                    var newPartida = new ModeloPartida(rowPartida[0]);
                                    if(participantes.indexOf(rowPartida[0].Turno) === participantes.length - 1){
                                        // ultimo
                                        newPartida.Turno = participantes[0];
                                    } else {
                                        newPartida.Turno = participantes[participantes.indexOf(rowPartida[0].Turno) + 1];
                                    }
                                    newPartida.Max_turno = rowPartida[0].Max_turno - 1;
                                    newPartida.Estado = 'Activa';
                                    newPartida.update(function(err, result) {
                                        if(err) {
                                            console.error("Error en actualizar partida despues de poner carta: " + err.message);
                                        } else if(result.length === 0) {
                                            console.error("No ha actualizado la partida");
                                        } else {
                                            res.redirect('/partida/' + req.params.nombre);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
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
                    var cartaAlLado = false;
                    tabla.forEach(function(obj, index, array){
                            var p = parseInt(carta.Path);
                            if(obj.Fila === filaCarta - 1 && obj.Columna === colCarta) { 
                                if(arriba.indexOf(parseInt(obj.Path)) > -1 && abajo.indexOf(p) === -1){
                                // arriba
                                    console.error("arriba");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                } else if(arriba.indexOf(parseInt(obj.Path)) === -1 && abajo.indexOf(p) > -1) {
                                    console.error("arriba");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                }
                                cartaAlLado = true;
                            }
                            if(obj.Fila === filaCarta && obj.Columna === colCarta + 1){
                                if(derecha.indexOf(parseInt(obj.Path)) > -1 && izquierda.indexOf(p) === -1){
                                // derecha
                                    console.error("derecha");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                } else if(derecha.indexOf(parseInt(obj.Path)) === -1 && izquierda.indexOf(p) > -1) {
                                    console.error("derecha");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                }
                                cartaAlLado = true;
                            }
                            if(obj.Fila === filaCarta + 1 && obj.Columna === colCarta){
                                if(abajo.indexOf(parseInt(obj.Path)) > -1 && arriba.indexOf(p) === -1){
                                    // abajo
                                    console.error("abajo");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                } else if(abajo.indexOf(parseInt(obj.Path)) === -1 && arriba.indexOf(p) > -1) {
                                    console.error("abajo");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                }
                                cartaAlLado = true;
                            }
                            
                            if(obj.Fila === filaCarta && obj.Columna === colCarta - 1){
                                if(izquierda.indexOf(parseInt(obj.Path)) > -1 && derecha.indexOf(p) === -1){
                                // izquierda
                                    console.error("izquierda");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                } else if(izquierda.indexOf(parseInt(obj.Path)) === -1 && derecha.indexOf(p) > -1) {
                                    console.error("izquierda");
                                    res.cookie("error", "posicion incorrecta");
                                    correcto = false;
                                }
                                cartaAlLado = true;
                            }
                            
                        if (index === array.length - 1) {
                            if(correcto && cartaAlLado){
                                carta.ponerCarta(function(err, result) {
                                    if(err) {
                                        console.error("Error en poner carta al casila: " + err.message);
                                    } else {
                                        res.clearCookie("cartaSeleccionada");
                                        carta.readCartasMano(function(err, cartasEnMano) {
                                            if(err) {
                                                console.error("Error en leer carta en mano despues de poner carta a la tabla: " + err.message);
                                            } else {
                                                carta.repartirCarta(1, cartasEnMano, function(err, result) {
                                                    if(err) {
                                                        console.error("Error en repartir carta despues de poner carta a la tabla: " + err.message);
                                                    } else {
                                                        var partida = new ModeloPartida("undefined");
                                                        partida.readActivas(req.params.nombre, function(err, rowPartida) {
                                                            if(err) {
                                                                console.error("Error en leer partida despues de repartir nueva carta: " + err.message);
                                                            } else if(rowPartida.length === 0) {
                                                                console.error("No encuentra la partida");
                                                            } else {
                                                                var encontrado = false;
                                                                var fila = parseInt(carta.Fila), col = parseInt(carta.Columna);
                                                                if(rowPartida[0].PosOro === 1) {
                                                                    if((fila === 0 && col === 6) || (fila === 1 && col === 5) || (fila === 2 && col === 6)){
                                                                            encontrado = true;
                                                                    }
                                                                } else if(rowPartida[0].PosOro === 3) {
                                                                    if((fila === 2 && col === 6) || (fila === 3 && col === 5) || (fila === 4 && col === 6)){
                                                                        encontrado = true;
                                                                    }                                                                    
                                                                } else {
                                                                    if((fila === 4 && col === 6) || (fila === 5 && col === 5) || (fila === 6 && col === 6)){
                                                                        encontrado = true;
                                                                    }                                                                    
                                                                }
                                                                var participantes = rowPartida[0].Participantes.split(',');
                                                                var newPartida = new ModeloPartida(rowPartida[0]);
                                                                if(participantes.indexOf(rowPartida[0].Turno) === participantes.length - 1){
                                                                    // ultimo
                                                                    newPartida.Turno = participantes[0];
                                                                } else {
                                                                    newPartida.Turno = participantes[participantes.indexOf(rowPartida[0].Turno) + 1];
                                                                }
                                                                newPartida.Max_turno = rowPartida[0].Max_turno - 1;
                                                                console.log(encontrado);
                                                                if(encontrado) {
                                                                    newPartida.Estado = 'Terminada';
                                                                    newPartida.terminarPartida(req.session.jugador.Nick, function(err, result) {
                                                                        if(err) {
                                                                            console.error("Error en actualizar partida despues de poner carta: " + err.message);
                                                                        } else if(result.length === 0) {
                                                                            console.error("No ha actualizado la partida");
                                                                        } else {
                                                                            console.log("ha ganado el equipo de " + req.session.jugador.Nick);
                                                                            res.redirect('/jugador/' + req.session.jugador.Nick);
                                                                        }
                                                                    });
                                                                } else {
                                                                    newPartida.Estado = 'Activa';
                                                                    newPartida.update(function(err, result) {
                                                                        if(err) {
                                                                            console.error("Error en actualizar partida despues de poner carta: " + err.message);
                                                                        } else if(result.length === 0) {
                                                                            console.error("No ha actualizado la partida");
                                                                        } else {
                                                                            res.redirect('/partida/' + req.params.nombre);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else if (!cartaAlLado) {
                                res.cookie("error", "No existe ruta para llegar este posicion");
                                res.redirect('/partida/' + req.params.nombre);
                            }else {
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
                            carta.readCartasMano(function(err, cartasEnMano) {
                                if(err) {
                                    console.error("Error en leer carta en mano despues de poner carta a la tabla: " + err.message);
                                } else {
                                    carta.repartirCarta(1, cartasEnMano, function(err, result) {
                                        if(err) {
                                            console.error("Error en repartir carta despues de poner carta a la tabla: " + err.message);
                                        } else {
                                            res.redirect('/partida/' + req.params.nombre);
                                        }
                                    });
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