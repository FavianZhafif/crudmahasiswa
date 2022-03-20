var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Student page. */

router.get('/', function(req, res, next) {
	res.render('student/fakultas1');
});

module.exports = router;
