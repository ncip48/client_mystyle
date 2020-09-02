//use path module
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const crypto = require("crypto");
const cors = require("cors");
const port = process.env.PORT || 9000;

const conn = mysql.createPool({
  host: "83.136.216.67",
  user: "u6083019_ncip",
  password: "mbahcip123",
  database: "u6083019_ci_market_place",
});

/*const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ci_market_client1",
});*/

conn.getConnection((err) => {
  if (err) throw err;
  console.log("Mysql Connected...");
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function hashpw(password) {
  let pw = crypto.createHash("md5").update(password).digest("hex");
  return crypto.createHash("sha512").update(pw).digest("hex");
}

function hashresult(results) {
  return crypto.createHash("sha512").update(results).digest("hex");
}

app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let sql =
    "SELECT * FROM tb_user WHERE username='" +
    username +
    "' AND password='" +
    hashpw(password) +
    "'";
  conn.query(sql, (err, results) => {
    //console.log(results.length)
    results.length === '1' ? res.json({ result: 1, data: results }) : res.json({ result: 0, error: "username/password salah" })
  });
});

app.get("/getdetail/:username", (req, res) => {
  let username = req.params.username;
  let q1 =
    "SELECT COUNT(*) AS jumlah_followers FROM tb_followers a JOIN tb_user b ON a.id_konsumen=b.id_konsumen WHERE b.username='" +
    username +
    "'";
  conn.query(q1, (err, followers) => {
    let q2 =
      "SELECT COUNT(*) AS jumlah_following FROM tb_followers a JOIN tb_user b ON  a.id_following=b.id_konsumen WHERE b.username='" +
      username +
      "'";
    conn.query(q2, (err, following) => {
      let q3 =
        "SELECT COUNT(*) AS jumlah_post FROM tb_post a JOIN tb_user b ON a.id_konsumen=b.id_konsumen WHERE b.username='" +
        username +
        "'";
      conn.query(q3, (err, post) => {
        let q4 = "SELECT * FROM tb_user WHERE username='" + username + "'";
        conn.query(q4, (err, user) => {
          let q5 =
            "SELECT a.* FROM tb_post a JOIN tb_user b ON a.id_konsumen=b.id_konsumen WHERE b.username='" +
            username +
            "'";
          conn.query(q5, (err, posting) => {
            res.json({
              result: "1",
              data: {
                jumlah_followers: JSON.parse(JSON.stringify(followers))[0]
                  .jumlah_followers,
                jumlah_following: JSON.parse(JSON.stringify(following))[0]
                  .jumlah_following,
                jumlah_post: JSON.parse(JSON.stringify(post))[0].jumlah_post,
                user: JSON.parse(JSON.stringify(user))[0],
                post: JSON.parse(JSON.stringify(posting)),
              },
            });
          });
        });
      });
    });
  });
});

app.get("/homepage/:username", (req, res) => {
  let username = req.params.username;
  let sql =
    "SELECT a.id_post, a.img, a.judul_post, a.likes , b.* FROM tb_post a JOIN tb_user b ON a.id_konsumen=b.id_konsumen JOIN tb_followers c ON b.id_konsumen=c.id_konsumen JOIN tb_user d ON c.id_following=d.id_konsumen WHERE d.username='" +
    username +
    "'";
  conn.query(sql, (err, results) => {
    res.json({ result: "1", data: results });
  });
});

app.listen(port, function () {
  console.log("Our app is running on http://localhost:" + port);
});
