var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    return res.render('dashboard');
});


module.exports = router;
