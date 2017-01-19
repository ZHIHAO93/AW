var express = require('express');
var daoUsuario = require('../models/ModeloUsuario');
var daoCurso = require('../models/ModeloCurso');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/principal', function(req, res, next) {
   res.render('principal', {}); 
});

router.get('/busqueda', function(req, res, next) {
    res.render('busqueda', {});
});

// Insertar un nuevo usuario
router.post('/nuevoUsuario', function(req, res, next) {
    var usuario = new daoUsuario(req.body);
    usuario.create(function(err, id) {
        if(err) {
            res.status(500);
            res.end();
        } else {
            res.json({ id: id });
        }
    });
});

// render el modal de insercion de curso
router.get('/renderInsercionModal', function(req, res, next) {
    res.render('modalInsercionCurso');
});

// Insertar un nuevo curso
router.post('/nuevoCurso', function(req, res, next) {
    // comprobamos todos los campos obligatorios esta rellenos
    if(req.body.titulo !== undefined && req.body.descripcion !== undefined && req.body.localidad !== undefined &&
            req.body.direccion !== undefined && req.body.plazas !== undefined && req.body.fecha_ini !== undefined &&
            req.body.fecha_fin !== undefined && req.body.horario !== undefined) {
        var curso = new daoCurso(req.body);
        curso.create(function(err, id) {
            if(err) {
                res.status(500);
                res.end();
            } else {
                res.json({ id: id });
            }
        });   
    } else {
        // error falta de introducir algun dato
        res.status(400);
        res.end();
    }
});

router.put('/modificaCurso', function(req, res, next) {
   var idCurso = Number(req.body.id);
   var curso = new daoCurso(req.body);
});

router.delete('/eliminarCurso', function(req, res, next) {
   var idCurso = Number(req.body.id);
   var curso = new daoCurso("undefined");
   if(idCurso !== undefined && !isNaN(idCurso)) {
       curso.delete(idCurso, function(err, affectedRows) {
           if(err) {
                res.status(500);
           } else {
                if(affectedRows === 0){
                    res.status(404);
                } else {
                    res.status(200);
                }
           }
           res.end();
       });
   } else {
       res.status(404);
       res.end();
   }
});

router.get('/leerCurso', function(req, res, next) {
   var idCurso = Number(req.query.id);
   var curso = new daoCurso("undefined");
   if(idCurso !== undefined && !isNaN(idCurso)) {
       curso.read(idCurso, function(err, result) {
           if(err) {
                res.status(500);
           } else {
                if(result === 0){
                    res.status(404);
                    res.end();
                } else {
                    res.json(result);
                }
           }
       });
   } else {
       res.status(404);
       res.end();
   }
});

router.post('/rendInfoCurso', function(req, res, next) {
    console.log(req.body);
    res.render('infoCurso', { curso: req.body } );
});

module.exports = router;
