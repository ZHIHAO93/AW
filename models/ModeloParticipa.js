"use strict";

var mysql = require('./db');

function Participacion(participacion) {
    this.Jugador = participacion.Jugador,
    this.Role = participacion.Role,
    this.Partida = participacion.Partida;
}

Participacion.prototype.unir = function(callback) {
    var conexion = mysql.createConnection();
    var nuevaParticipacion = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "Insert into participa set ?",
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

Participacion.prototype.participantes = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "Select Jugador from participa where partida = ?",
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

Participacion.prototype.asignarRole = function(saboteadores, callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                    "Update Participa set Role = 'Buscador' where partida = ?",
                    partida,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            var query = "";
                            var valores = [];
                            if(saboteadores.length === 1){
                                query = "Update Participa set Role = 'Saboteador' where partida = ? and jugador = ?";
                                valores = [partida, saboteadores[0]];
                            } else {
                                query = "Update Participa set Role = 'Saboteador' where partida = ? and (jugador = ? or jugador = ?)";
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