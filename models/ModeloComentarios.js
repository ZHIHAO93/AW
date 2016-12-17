"use strict";

var mysql = require('./db');

function Comentario(comentario) {
    this.Jugador = comentario.Jugador;
    this.Comentario = comentario.Comentario;
    this.Partida = comentario.Partida;
    var fecha = new Date();
    this.Fecha = fecha.getFullYear().toString() + (fecha.getMonth()+1).toString() + fecha.getDate().toString();
    this.Foto = comentario.Foto;
}

Comentario.prototype.ReadAll = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "Select * from comenta where partida = ?",
                partida,
                function(err, rowComentarios) {
                    if(err) {
                        callback(err, "undefined");
                    } else {
                        callback(null, rowComentarios);
                    }
                });
        }
    });
};

Comentario.prototype.comentar = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoComentario = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "Insert into comenta set ?",
            nuevoComentario,
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

module.exports = Comentario;