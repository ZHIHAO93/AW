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

Carta.prototype.readCartasMano = function(callback) {
    var conexion = mysql.createConnection();
    var PropPartida = [this.Propietario, this.Partida];
    conexion.connect(function(err) {
        if(err){
            callback(err, "undefined");
        } else {
            conexion.query(
                "Select * from Carta where Propietario = ? and Partida = ? and Estado = 'en mano'",
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

Carta.prototype.repartirCarta = function(callback) {
    var conexion = mysql.createConnection();
    var nuevaCarta = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "Insert into Carta set ?",
                nuevaCarta,
                function(err, result) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        callback(null, result);
                    }
                });
        }
    });
};

module.exports = Carta;