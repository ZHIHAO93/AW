"use strict";

var mysql = require('./db');

function Carta(carta){
    this.Fila = carta.Fila,
    this.Columna = carta.Columna,
    this.Propietario = carta.Propietario,
    this.Tipo = carta.Tipo,
    this.Partida = carta.Partida,
    this.Path = carta.Path,
    this.Estado = carta.Estado;
}

Carta.prototype.ponerCarta = function(callback) {
    var conexion = mysql.createConnection();
    var carta = this;
    carta.Estado = "Tabla";
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "update carta set ? where Propietario = ? and Partida = ? and Path = ? and Estado = 'Mano'",
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

Carta.prototype.readTabla = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "Select * from Carta where Partida = ? and Estado = 'Tabla' order by Fila, Columna",
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

Carta.prototype.readCartasMano = function(callback) {
    var conexion = mysql.createConnection();
    var PropPartida = [this.Propietario, this.Partida];
    conexion.connect(function(err) {
        if(err){
            callback(err, "undefined");
        } else {
            conexion.query(
                "Select Path from Carta where Propietario = ? and Partida = ? and Estado = 'Mano'",
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

Carta.prototype.repartirCarta = function(numCard, callback) {
    var conexion = mysql.createConnection();
    var nuevaCarta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            var newCartas = [];
            var valor = [];
            var n;
            var query = "Insert into carta (Propietario, Partida, Path, Estado) values ";
            for(var i=0;i<numCard;i++) {
                var obj = {};
                n = Math.floor(Math.random() * 15) + 1;
                while(valor.indexOf(n) > -1){
                    n = Math.floor(Math.random() * 15) + 1;
                }
                valor.push(n);
                obj.Path = n;
                newCartas.push(obj);
                query += "('" + nuevaCarta.Propietario + "', '" + nuevaCarta.Partida + "', '" + n + "','Mano'),";
            }
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