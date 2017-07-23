"use strict";

var mysql = require('./db');

/**
 * Constructora de participacion
 * @param {type} participacion
 * @returns {nm$_ModeloParticipa.Participacion}
 */
function Participacion(participacion) {
    this.Jugador = participacion.Jugador,
    this.Role = participacion.Role,
    this.Partida = participacion.Partida;
    this.Herramienta = "SI";
}

/**
 * Unir un jugador a una partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.unir = function(callback) {
    var conexion = mysql.createConnection();
    var nuevaParticipacion = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "INSERT INTO participa SET ?",
                    nuevaParticipacion,
                    function(err, rowParticipacion) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, rowParticipacion);
                        }
                    }
            );
        }
    });
};

/**
 * Modificamos el estado de la herramienta del jugador
 * @param {type} nuevoEstado el nuevo estado(SI, NO)
 * @param {type} jugador el jugador 
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.updateHerra = function(nuevoEstado, jugador, callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "UPDATE participa " +
                    "SET Herramienta = ? " +
                    "WHERE partida = ? AND Jugador = ?",
                    [nuevoEstado, partida, jugador],
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

/**
 * Leer los jugadores segun el estado de la herramienta en una partida
 * @param {type} estadoHer estado de la herramienta(SI, NO)
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.herramientas = function(estadoHer, callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "SELECT * " +
                    "FROM participa " +
                    "WHERE partida = ? AND Herramienta = ?",
                    [partida, estadoHer],
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

/**
 * Leer los roles y herramientas de todos los jugadores en una partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.roleYHerramienta = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    var jugador = this.Jugador;

    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "SELECT Role, Herramienta " +
                    "FROM participa " +
                    "WHERE partida = ? AND Jugador = ?",
                    [partida, jugador],
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

/**
 * Leer los participantes en una partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.participantes = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "SELECT Jugador FROM participa WHERE partida = ?",
                    partida,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

/**
 * Asignar los roles de los jugadores al inicio del juego
 * @param {type} saboteadores array de los saboteadores
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Participacion.prototype.asignarRole = function(saboteadores, callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            // primero asignamos todos los jugadores como buscador
            conexion.query(
                    "Update Participa set Role = 'Buscador' where partida = ?",
                    partida,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            // despues asinamos los saboteadores
                            var query = "";
                            var valores = [];
                            
                            // segun numero del jugador asignamos 1 saboteador o 2
                            if(saboteadores.length === 1){
                                query = "UPDATE Participa SET Role = 'Saboteador' WHERE partida = ? AND jugador = ?";
                                valores = [partida, saboteadores[0]];
                            } else {
                                query = "UPDATE Participa SET Role = 'Saboteador' WHERE partida = ? AND (jugador = ? or jugador = ?)";
                                valores = [partida, saboteadores[0], saboteadores[1]];
                            }
                            conexion.query(query,
                                valores,
                                function(err, result2){
                                    if(err) {
                                        callback(err, "undefined");
                                    } else {
                                        conexion.end();
                                        callback(null, result2);
                                    }
                                });
                        }
                    }
            );
        }
    });
};

module.exports = Participacion;