"use strict";

var mysql = require('./db');
var passwordHash = require('password-hash');

/**
 * Constructura del jugador
 * @param {type} jugador
 * @returns {nm$_ModeloJugador.Jugador}
 */
function Jugador(jugador) {
    this.Nick = jugador.Nick;
    this.Password = jugador.Password;
    this.Nombre_completo = jugador.Nombre_completo;
    this.Sexo = jugador.Sexo;
    this.Foto = jugador.Foto;
    this.Fecha_nacimiento = jugador.Fecha_nacimiento;
};

/**
 * Crear un nuevo jugador
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Jugador.prototype.create = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoJugador = this;

    // si no ha subido foto, usamos el foto anonimo
    if(nuevoJugador.Foto === '') {
        nuevoJugador.Foto = './perfil/anonimo.jpg';
    }
    conexion.connect(function(err) {
       if(err) {
           callback(err, "undefined");
       }  else {
           //encriptamos la contraseña
           nuevoJugador.Password = passwordHash.generate(nuevoJugador.Password);
           conexion.query(
                   "INSERT INTO jugador SET ?",
                   nuevoJugador,
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
 * Leer datos de un jugador por nick
 * @param {type} callback funcion de retorno
 * @returns {undefined}
 */
Jugador.prototype.read = function(callback) {
    var conexion = mysql.createConnection();
    var nick = this.Nick;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT * FROM jugador WHERE Nick=?",
                    nick,
                    function(err, result) {
                        if(err) {
                            return callback(err);
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
 * verificar la contraseña del jugador
 * @param {type} pass la contraseña que queremos verificar
 * @returns {Boolean}
 */
Jugador.prototype.checkPassword = function(pass) {
    if(passwordHash.verify(this.Password, pass)){
        return true;
    } else {
        return false;
    }
};

module.exports = Jugador;