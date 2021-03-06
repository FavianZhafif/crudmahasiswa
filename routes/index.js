var express = require('express');
var router = express.Router();
var modul = require('../modul/modul');
var session_store;
var ses;
/* GET home page. */
router.get('/', function (req, res, next) {
	res.redirect('/landing');
});

router.get('/landing', function (req, res, next) {
	req.getConnection(function (err, connection) {
		var query = connection.query(
			"SELECT * FROM daftar",
			function (err, rows) {
				if (err) var errornya = ("Error Selecting : %s ", err);
				req.flash("msg_error", errornya);
				res.render("student/fakultas1", {
					title: "Students",
					data: rows,
					session_store: req.session,
				});
			}
		);
		// console.log(query.sql);
	});
});

router.get("/tahun/(:tahun)", function (req, res, next) {
	req.getConnection(function (err, connection) {
		var query = connection.query(
			"SELECT * FROM daftar WHERE tahun_masuk= ?", req.params.tahun,
			function (err, rows) {
				if (err) var errornya = ("Error Selecting : %s ", err);
				req.flash("msg_error", errornya);
				res.render("student/tahunluar", {
					title: "Tahun Masuk",
					data: rows,
					session_store: req.session,
				});
			}
		);
		//console.log(query.sql);
	});
});

router.get("/fakultas/(:fakultas)", function (req, res, next) {
	req.getConnection(function (err, connection) {
		var query = connection.query(
			"SELECT * FROM daftar WHERE fakultas= ?", req.params.fakultas,
			function (err, rows) {
				if (err) var errornya = ("Error Selecting : %s ", err);
				req.flash("msg_error", errornya);
				res.render("student/fakultasluar", {
					title: "2022",
					data: rows,
					session_store: req.session,
				});
			}
		);
		//console.log(query.sql);
	});
});

router.get('/students', function (req, res, next) {
	res.redirect('/students');
});
router.get('/register', function (req, res, next) {
	res.render('main/register', { title: "Register Page" });
});
router.post("/register", function (req, res, next) {
	req.assert("nama", "Please fill the Name").notEmpty();
	req.assert("email", "Email not valid").isEmail();
	req.assert("phone", "Please fill the Phone").notEmpty();
	req.assert("password", "Please fill the Password").notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		v_nama = req.sanitize("nama").escape().trim();
		v_email = req.sanitize("email").escape().trim();
		v_phone = req.sanitize("phone").escape().trim();
		v_password = req.sanitize("password").escape();
		var user = {
			nama: v_nama,
			email: v_email,
			phone: v_phone,
			password: v_password,

		};

		var insert_sql = "INSERT INTO user SET ?";
		req.getConnection(function (err, connection) {
			var query = connection.query(
				insert_sql,
				user,
				function (err, result) {
					if (err) {
						var errors_detail = ("Error Insert : %s ", err);
						req.flash("msg_error", errors_detail);
						res.render("main/register", {
							nama: req.param("nama"),
							email: req.param("email"),
							phone: req.param("phone"),
							password: req.param("password"),
							session_store: req.session,
						});
					} else {
						req.flash("msg_info", "Create Account Success");
						res.redirect("/login");
					}
				}
			);
		});
	} else {
		console.log(errors);
		errors_detail = "<p>Sorry there are error</p><ul>";
		for (i in errors) {
			error = errors[i];
			errors_detail += "<li>" + error.msg + "</li>";
		}
		errors_detail += "</ul>";
		req.flash("msg_error", errors_detail);
		res.render("main/register", {
			nama: req.param("nama"),
			email: req.param("email"),
			phone: req.param("phone"),
			password: req.param("password"),
			session_store: req.session,
		});
	}
});
router.get('/login', function (req, res, next) {
	res.render('main/login', { title: "Login Page" });
});
router.post('/login', function (req, res, next) {
	session_store = req.session;
	req.assert('txtEmail', 'Email not valid').isEmail();
	req.assert('txtPassword', 'Please fill the Password').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		req.getConnection(function (err, connection) {
			v_pass = req.sanitize('txtPassword').escape().trim();
			v_email = req.sanitize('txtEmail').escape().trim();

			var query = connection.query('select * from user where email="' + v_email + '" and password="' + v_pass + '"', function (err, rows) {
				if (err) {

					var errornya = ("Error Selecting : %s ", err.code);
					console.log(err.code);
					req.flash('msg_error', errornya);
					res.redirect('/login');
				} else {
					if (rows.length <= 0) {

						req.flash('msg_error', "Wrong email address or password. Try again.");
						res.redirect('/login');
					}
					else {
						session_store.is_login = true;
						res.redirect('/students/students');
					}
				}

			});
		});
	}
	else {
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) {
			error = errors[i];
			errors_detail += '<li>' + error.msg + '</li>';
		}
		errors_detail += "</ul>";
		console.log(errors_detail);
		req.flash('msg_error', errors_detail);
		res.redirect('/login');
	}
});
router.get('/logout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});
module.exports = router;
