"use strict";

var mysql = require('./db');
var ModeloParticipacion = require('./ModeloParticipa');

/**
 * Constructora de partida
 * @param {type} partida
 * @returns {nm$_ModeloPartida.Partida}
 */
function Partida(partida) {
    this.Nombre = partida.Nombre;
    this.Creador = partida.Creador;
    this.Fecha = new Date();
    this.Turno = "";
    this.Estado = "Abierta";
    this.Ganador = "";
    this.Max_jugadores = partida.Max_jugadores;
    var numTurno = -1;
    switch(parseInt(partida.Max_jugadores)) {
        case 3:
            numTurno = 50;
            break;
        case 4:
            numTurno = 45;
            break;
        case 5:
        case 6:
            numTurno = 40;
            break;
        case 7:
            numTurno = 35;
            break;
        default:
            break;
    }
    this.Max_turno = numTurno;
    this.PosOro = partida.PosOro;
}

/**
 * Cambiar el estado de una partida al 'Terminada'
 * @param {type} ganador el equipo ganador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Partida.prototype.terminarPartida = function(ganador, callback) {
    var conexion = mysql.createConnection();
    var partida = this.Nombre;
    conexion.connect(function(err) {
        if (err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "UPDATE partida p, Participa pa " +
                    "SET p.Ganador = pa.Role, p.Estado = 'Terminada' " +
                    "WHERE p.Nombre = '" + partida + "' AND p.Nombre = pa.Partida AND pa.Jugador = '" + ganador + "'",
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
 * Crear una partida
 * @param {type} callback
 * @returns {undefined}
 */
Partida.prototype.create = function(callback) {
  var conexion = mysql.createConnection();
  var nuevaPartida = this;
  conexion.connect(function(err) {
      if(err) {
          callback(err, "undefined");
      } else {
          conexion.query(
                  "INSERT INTO partida SET ?",
                  nuevaPartida,
                  function(err, result) {
                      if(err) {
                          callback(err, "undefined");
                      } else {
                          conexion.end();
                          
                          // despues de crear partida, unimos el creador al partida
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

/**
 * Modificar una partida con su nombre
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Partida.prototype.update = function(callback) {
    var conexion = mysql.createConnection();
    var nuevaPartida = this;
    conexion.connect(function(err){
       if(err) {
           callback(err, "undefined");
       } else {
           conexion.query(
                   "UPDATE partida SET ? WHERE Nombre = ?",
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

/**
 * Leer una partida con su nombre
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Partida.prototype.read = function(callback) {
	var conexion = mysql.createConnection();
        var partida = this.Nombre;
	conexion.connect(function(err){
            if(err) {
                callback(err, "undefined");
            } else {
                conexion.query(
                        "SELECT * FROM partida WHERE Nombre = ?",
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
 * Leer todas las partida
 * @param {type} jugador nick del jugador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Partida.prototype.readAll = function(jugador, callback) {
	var conexion = mysql.createConnection();
        var p = this;
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "SELECT " +
                                "partida.Nombre, " +
                                "Date_format(partida.Fecha, '%d-%m-%Y') as Fecha, " +
                                "partida.Estado, " +
                                "partida.Creador, " +
                                "partida.Turno, " +
                                "partida.Ganador, " +
                                "partida.Max_jugadores, " +
                                "count(participa.Jugador) as Num_jugadores, " +
                                "participa.Role " +
                            "FROM partida, participa " +
                            "WHERE partida.Nombre = participa.Partida and participa.Jugador = '" + jugador + "' " +
                            "Group by partida.Nombre",
                            function(err, result) {
                                    if(err) {
                                        callback(err, "undefined");
                                    } else {
                                        conexion.end();
                                        // y las que estan abiertas
                                        p.readAbiertas(function(err, resultAbiertas) {
                                            if(err) {
                                                callback(err, "undefined");
                                            } else {
                                                callback(null, result, resultAbiertas);
                                            }
                                        });
                                    }
                            }
                    );
		}
	});
};

/**
 * Leer las partidas que estan abiertas
 * @param {type} callback
 * @returns {undefined}
 */
Partida.prototype.readAbiertas = function(callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "SELECT " +
                                "partida.Nombre, " +
                                "partida.Creador, " +
                                "Date_format(partida.Fecha, '%d-%m-%Y') as Fecha, " +
                                "partida.Max_jugadores, " +
                                "GROUP_CONCAT(participa.Jugador) as Participantes " +
                            "FROM partida, participa " +
                            "WHERE partida.Estado='Abierta' AND partida.Nombre = participa.Partida " +
                            "Group by partida.Nombre",
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
 * Leer una partida que esta activa
 * @param {type} partida el nombre de la partida
 * @param {type} jugador el nick del jugador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Partida.prototype.readActivas = function(partida, jugador, callback) {
	var conexion = mysql.createConnection();
	conexion.connect(function(err){
		if(err) {
                    callback(err, "undefined");
		} else {
                    conexion.query(
                            "SELECT " +
                                "partida.*, " +
                                "GROUP_CONCAT(participa.Jugador) as Participantes, " +
                                "count(participa.Jugador) as numJugadores " +
                            "FROM partida, participa " +
                            "WHERE partida.Nombre = ? AND partida.Nombre = participa.Partida " +
                            "Group by partida.Nombre",
                            partida,
                            function(err, rowPartida) {
                                    if(err) {
                                        callback(err, "undefined");
                                    } else {
                                        conexion.end();
                                        var participa = new ModeloParticipacion({Jugador: jugador, Partida: partida});
                                        // y leemos role del jugador y el estado de su herramienta
                                        participa.roleYHerramienta(function(err, roleHerra) {
                                            if(err) {
                                                callback(err, "undefined");
                                            } else {
                                                callback(null, rowPartida, roleHerra[0]);
                                            }
                                        });
                                    }
                            }
                    );
		}
	});
};

module.exports = Partida;