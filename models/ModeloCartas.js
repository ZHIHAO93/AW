"use strict";

var mysql = require('./db');

/**
 * Constructora de carta
 * @param {type} carta
 * @returns {nm$_ModeloCartas.Carta}
 */
function Carta(carta){
    this.Fila = carta.Fila,
    this.Columna = carta.Columna,
    this.Propietario = carta.Propietario,
    this.Partida = carta.Partida,
    this.Path = carta.Path,
    this.Estado = carta.Estado;
    this.Visible = 0;
}

/**
 * Poner una de los cartas del destino que sera visible
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.Lupa = function(callback) {
    var conexion = mysql.createConnection();
    var carta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "UPDATE carta " + 
                "SET Visible = 1 " + 
                "WHERE Fila = " + carta.Fila + " AND Columna = " + carta.Columna + " AND Partida = '" + carta.Partida + "'",
                function(err, result) {
                    if(err) {
                        callback(err, null);
                    } else {
                        conexion.end();
                        callback(null, result);
                    }
                });
        }
    });
};

/**
 * Eliminar una carta del tablero, segun fila, columna y partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.Bombardear = function(callback) {
    var conexion = mysql.createConnection();
    var carta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "DELETE " +
                "FROM carta " +
                "WHERE Fila = " + carta.Fila + " AND Columna = " + carta.Columna + " AND Partida = '" + carta.Partida + "'",
                function(err, result) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        conexion.end();
                        callback(null, result);
                    }
                });
        }
    });
};

/**
 * Eliminar una carta de la mano del jugador, pasando propietario, partida y carta(Path)
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.eliminarCarta = function(callback) {
    var conexion = mysql.createConnection();
    var carta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "DELETE " +
                "FROM carta " +
                "WHERE Propietario = '" + carta.Propietario + "' AND Partida = '" + carta.Partida + "' AND Path = '" + carta.Path + "'",
                function(err, result) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        conexion.end();
                        callback(null, result);
                    }
                });
        }
    });
};

/**
 * Poner las cartas iniciales del tablero, inicio y los tres destinos
 * Asignarlos en bd como carta T15
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.ponerCartasIniciales = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            var query = "INSERT INTO carta (Fila, Columna, Partida, Path, Estado, Visible) values "
                        + "(3, 0, '" + partida + "', 'T15', 'Tabla', 0),"
                        + "(1, 6, '" + partida + "', 'T15', 'Tabla', 0),"
                        + "(3, 6, '" + partida + "', 'T15', 'Tabla', 0),"
                        + "(5, 6, '" + partida + "', 'T15', 'Tabla', 0)";
            conexion.query(
                query,
                function(err, result) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        conexion.end();
                        callback(null, result);
                    }
                });
        }
    });
};

/**
 * Poner una carta en el tablero
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.ponerCarta = function(callback) {
    var conexion = mysql.createConnection();
    var carta = this;
    carta.Estado = "Tabla";
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "UPDATE carta " +
                    "SET ? " +
                    "WHERE Propietario = ? AND Partida = ? AND Path = ? AND Estado = 'Mano'",
                    [carta, carta.Propietario, carta.Partida, carta.Path],
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
 * Leer todas las cartas puestas en el tablero de una partida
 * Ordenando por fila y columna
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.readTabla = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT * " + 
                    "FROM Carta " +
                    "WHERE Partida = ? AND Estado = 'Tabla' " + 
                    "ORDER BY Fila, Columna",
                    partida,
                    function(err, rowCartas) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, rowCartas);
                        }
                    }
            );
        }
    });
};

/**
 * Leer las cartas de la mano de un jugador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.readCartasMano = function(callback) {
    var conexion = mysql.createConnection();
    var PropPartida = [this.Propietario, this.Partida];
    conexion.connect(function(err) {
        if(err){
            callback(err, "undefined");
        } else {
            conexion.query(
                "SELECT Path " +
                "FROM Carta " +
                "WHERE Propietario = ? AND Partida = ? AND Estado = 'Mano'",
                PropPartida,
                function(err, result) {
                    if(err){
                        callback(err, "undefined");
                    } else {
                        callback(null, result);
                    }
                });
        }
    });
};

/**
 * Repartir las carta al jugador
 * @param {type} numCard el numero de carta a repartir
 * @param {type} CartasEnMano array de las cartas que ya tiene el jugador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Carta.prototype.repartirCarta = function(numCard, CartasEnMano, callback) {
    var conexion = mysql.createConnection();
    var nuevaCarta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            // newCartas es el objeto de las cartas(en mano+nuevas)
            var newCartas = CartasEnMano;
            
            // un nuevo array y pasa las cartas a este array
            var valor = [];
            newCartas.forEach(function(obj) {
                valor.push(obj.Path);
            });
            var n;
            var query = "INSERT INTO carta (Propietario, Partida, Path, Estado) values ";
            
            for(var i=0;i<numCard;i++) {
                var obj = {};
                
                // general un numero aleatorio de 1 al 19
                n = Math.floor(Math.random() * 19) + 1;
                switch(n) {
                    case 16:
                        n = "Lupa";
                        break;
                    case 17:
                        n = "Bomba";
                        break;
                    case 18:
                        n = "PicoArreglado";
                        break;
                    case 19:
                        n = "PicoRoto";
                        break;
                    default:
                        n = "T" + n;
                        break;          
                }
                
                // mientras que el numero generado ya lo tiene en mano, seguimos generando
                while(valor.indexOf(n) > -1){
                    n = Math.floor(Math.random() * 19) + 1;
                    switch(n) {
                        case 16:
                            n = "Lupa";
                            break;
                        case 17:
                            n = "Bomba";
                            break;
                        case 18:
                            n = "PicoArreglado";
                            break;
                        case 19:
                            n = "PicoRoto";
                            break;
                        default:
                            n = "T" + n;
                            break;          
                    }
                }
                
                // ponemos el nuevo valor en el array
                valor.push(n);
                
                obj.Path = n;
                newCartas.push(obj);
                query += "('" + nuevaCarta.Propietario + "', '" + nuevaCarta.Partida + "', '" + n + "','Mano'),";
            }
            
            //quitar el ultimo , del query
            query = query.substring(0, query.length-1);
            conexion.query(
                query,
                function(err, result) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        callback(null, newCartas);
                    }
                });
        }
    });
};

module.exports = Carta;