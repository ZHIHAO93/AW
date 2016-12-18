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

/**
 * Leer todos los comentarios de la partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Comentario.prototype.ReadAll = function(callback) {
    var conexion = mysql.createConnection();
    var partida = this.Partida;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                "SELECT * " + 
                "FROM comenta " +
                "WHERE partida = ?",
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

/**
 * Comentar una partida
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Comentario.prototype.comentar = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoComentario = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "INSERT INTO comenta SET ?",
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