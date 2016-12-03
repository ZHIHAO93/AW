var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.jugador){
        res.redirect('/jugador/' + req.session.jugador.Nick);
    } else {
        res.render('index', { jugador: ""});
    }
});

router.get('/logout', function(req, res) {
    req.session.jugador = null;
    console.log("cerrar session");
    res.redirect('/');
});

module.exports = router;
