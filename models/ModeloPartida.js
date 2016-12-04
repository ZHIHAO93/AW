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
                            "SELECT partida.Nombre, Date_format(partida.Fecha, '%d-%m-%Y') as Fecha, partida.Estado, partida.Creador, partida.Turno, partida.Ganador, partida.Max_jugadores, count(participa.Jugador) as Num_jugadores \n\
                                from partida, participa \n\
                                where partida.Nombre = participa.Partida Group by partida.Nombre",
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

Partida.prototype.readAbiertas = function(callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "SELECT partida.Nombre, Date_format(partida.Fecha, '%d-%m-%Y') as Fecha, partida.Max_jugadores, GROUP_CONCAT(participa.Jugador) as Participantes \n\
                                from partida, participa \n\
                                where partida.Estado='Abierta' and partida.Nombre = participa.Partida Group by partida.Nombre",
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

Partida.prototype.readActivas = function(partida, callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "SELECT partida.*, GROUP_CONCAT(participa.Jugador) as Participantes, count(participa.Jugador) as numJugadores \n\
                                from partida, participa \n\
                                where partida.Nombre = ? and partida.Nombre = participa.Partida Group by partida.Nombre",
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

module.exports = Partida;