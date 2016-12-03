"use strict";

var mysql = require('./db');
var ModeloParticipacion = require('./ModeloParticipa');

function Partida(partida) {
    this.Nombre = partida.Nombre;
    this.Creador = partida.Creador;
    var fecha = new Date();
    this.Fecha = fecha.getFullYear().toString() + (fecha.getMonth()+1).toString() + fecha.getDate().toString();
    this.Turno = "";
    this.Estado = "Abierta";
    this.Ganador = "";
    this.Max_jugadores = partida.Max_jugadores;
    var numTurno = -1;
    switch(this.Max_jugadores) {
        case "3":
            numTurno = 50;
            break;
        case "4":
            numTurno = 45;
            break;
        case "5":
        case "6":
            numTurno = 40;
            break;
        case "7":
            numTurno = 35;
            break;
        default:
            break;
    }
    this.Max_turno = numTurno;
}

Partida.prototype.create = function(callback) {
  var conexion = mysql.createConnection();
  var nuevaPartida = this;
  conexion.connect(function(err) {
      if(err) {
          callback(err, "undefined");
      } else {
          conexion.query(
                  "Insert into partida set ?",
                  nuevaPartida,
                  function(err, result) {
                      if(err) {
                          callback(err, "undefined");
                      } else {
                          conexion.end();
                           var participacion = {
                                Jugador: nuevaPartida.Creador,
                                Role: "",
                                Partida: nuevaPartida.Nombre
                            };
                            var participa = new ModeloParticipacion(participacion);
                            participa.unir(function(err, result2) {
                                if(err) {
                                    callback(err, "undefined");
                                } else {
                                    callback(null, result);
                                }
                            });
                      }
                  }
          );
      }
  });
};

Partida.prototype.update = function(callback) {
    var conexion = mysql.createConnection();
    var nuevaPartida = this;
    conexion.connect(function(err){
       if(err) {
           callback(err, "undefined");
       } else {
           conexion.query(
                   "Update partida set ? where Nombre = ?",
                   [nuevaPartida, nuevaPartida.Nombre],
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

Partida.prototype.read = function(callback) {
	var conexion = mysql.createConnection();
        var partida = this.Nombre;
	conexion.connect(function(err){
            if(err) {
                callback(err, "undefined");
            } else {
                conexion.query(
                        "Select * from partida where Nombre = ?",
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

Partida.prototype.readAll = function(callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "Select * from partida",
                            function(err, result) {
                                    if(err) {
                                        callback(err, "undefined");
                                    } else {
                                        conexion.end();
                                        if(result.length > 0){
                                            result.forEach(function(partida, index, array){
                                                var participa = new ModeloParticipacion({Partida: partida.Nombre});
                                                participa.participantes(function(err, rowJugadores) {
                                                    if(err) {
                                                        callback(err, "undefined");
                                                    } else {
                                                        partida.Num_jugadores = rowJugadores.length;
                                                        if(index === array.length - 1){
                                                            callback(null, result);
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            callback(null, result);
                                        }
                                    }
                            }
                    );
		}
	});
};

Partida.prototype.readAbiertas = function(callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "Select * from partida where estado = 'Abierta'",
                            function(err, result) {
                                    if(err) {
                                        callback(err, "undefined");
                                    } else {
                                        conexion.end();
                                        result.forEach(function(obj, index, array){
                                            obj.Fecha /= obj.Fecha.getFullYear().toString() + "-"
                                                + (obj.Fecha.getMonth() + 1).toString() + "-"
                                                + obj.Fecha.getDate().toString();
                                            if(index === array.length - 1){
                                                callback(null, result);
                                            }
                                        });
                                    }
                            }
                    );
		}
	});
};

module.exports = Partida;