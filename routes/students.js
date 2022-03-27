var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
var dbConn = require('../library/db');
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Student page. */

router.get("/students/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM daftar",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("student/list", {
          title: "Students",
          data: rows,
          session_store: req.session,
        });
      }
    );
    // console.log(query.sql);
  });
});

router.get("/tahun/(:tahun)", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM daftar WHERE tahun_masuk= ?",req.params.tahun,
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("student/tahun", {
          title: "Tahun Masuk",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.get("/fakultas/(:fakultas)", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM daftar WHERE fakultas= ?",req.params.fakultas,
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("student/fakultas", {
          title: "2022",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var student = {
        id: req.params.id,
      };

      var delete_sql = "delete from daftar where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          student,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/students/students");
            } else {
              req.flash("msg_info", "Delete Student Success");
              res.redirect("/students/students");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM daftar where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/students/students");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Student can't be find!");
              res.redirect("/students/students");
            } else {
              console.log(rows);
              res.render("student/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("nama", "Tolong Masukkan Nama").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nama = req.sanitize("nama").escape().trim();
      v_nim = req.sanitize("nim").escape().trim();
      v_ttl = req.sanitize("ttl").escape().trim();
      v_alamat = req.sanitize("alamat").escape().trim();
      v_fakultas = req.sanitize("fakultas").escape().trim();
      v_tahun_masuk = req.sanitize("tahun_masuk").escape();

      if (!req.files) {
        var student = {
          nama: v_nama,
          nim: v_nim,
          ttl: v_ttl,
          alamat: v_alamat,
          fakultas: v_fakultas,
          tahun_masuk: v_tahun_masuk,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpeg" || "image/png";
        file.mv("public/images/upload/" + file.name);

        var student = {
          nama: v_nama,
          nim: v_nim,
          ttl: v_ttl,
          alamat: v_alamat,
          fakultas: v_fakultas,
          tahun_masuk: v_tahun_masuk,
          gambar: file.name,
        }
      };

      var update_sql = "update daftar SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          student,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("student/edit", {
                nama: req.param("nama"),
                nim: req.param("nim"),
                ttl: req.param("ttl"),
                alamat: req.param("alamat"),
                fakultas: req.param("fakultas"),
                tahun_masuk: req.param("tahun_masuk"),
                gambar: req.param("gambar"),
              });
            } else {
              req.flash("msg_info", "Update student success");
              res.redirect("/students/students");
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/students/edit/" + req.params.id);
    }
  }
);

router.post("/add", function (req, res, next) {
  message = "";
  const errors = validationResult(req);
  if (!errors || req.method == "POST") {
    var data = req.body;
    var nama = data.nama;
    var nim = data.nim;
    var ttl = data.ttl;
    var alamat = data.alamat;
    var fakultas = data.fakultas;
    var tahun_masuk = data.tahun_masuk;

    if (!req.files) {
      console.log(errors);
      errors_detail = "No files were uploaded";
      req.flash("msg_error", errors_detail);
      res.render("student/add-student");
    }

    var file = req.files.gambar;
    var gambar = file.name;

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      file.mv("public/images/upload/" + file.name, function (err) {
        if (err) return res.status(500).send(err);
        var sql =
          "INSERT INTO daftar(nama,nim,ttl,alamat,fakultas,tahun_masuk,gambar)VALUES('" +
          nama +
          "','" +
          nim +
          "','" +
          ttl +
          "','" +
          alamat +
          "','" +
          fakultas +
          "','" +
          tahun_masuk +
          "','" +
          gambar +
          "')";
        dbConn.query(sql, function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("student/add-student");
          } else {
            req.flash("msg_info", "Create student success");
            res.redirect("/students/students");
          }
        });
      });
    } else {
      req.flash("msg_info", "Create student success");
      res.redirect("/students/students");
    }
  } else {
    console.log(errors);
    errors_detail = "<p>Sorry There Are Error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("student/add-student", {
      nama: req.param("nama"),
      nim: req.param("nim"),
      ttl: req.param("ttl"),
      alamat: req.param("alamat"),
      fakultas: req.param("fakultas"),
      tahun_masuk: req.param("tahun_masuk"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("student/add-student", {
    title: "Add New Student",
    nama: "",
    nim: "",
    ttl: "",
    alamat: "",
    fakultas: "",
    tahun_masuk: "",
    session_store: req.session,
  });
});

module.exports = router;
