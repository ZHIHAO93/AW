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
                "Select * from Carta where Propietario = ? and Partida = ?",
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
            var query = "";
            for(var i=0;i<1;i++) {
                var n = Math.floor(Math.random() * 15) + 1;
                newCartas.push(n);
                query += "Insert into carta set 'Propietario'=" + nuevaCarta.Propietario + ", 'Partida'=" + nuevaCarta.Partida + ", 'Path'=" + n + ";";
            }
            console.log(query);
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