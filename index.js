//use path module
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const crypto = require("crypto");
var cors = require("cors");
var port = process.env.PORT || 9000;

const conn = mysql.createConnection({
  host: "83.136.216.67",
  user: "u6083019_ncip",
  password: "mbahcip123",
  database: "u6083019_ci_market_place",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected...");
});

//set views file
app.set("views", path.join(__dirname, "views"));
app.use(cors());
//set view engine
app.set("view engine", "jade");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set folder public as static folder for static file
app.use("/assets", express.static(__dirname + "/public"));

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
  //let pw = crypto.createHash('md5').update(password).digest('hex');
  //let pass = crypto.createHash('sha512').update(pw).digest('hex');
  //console.log(pass);
  let sql =
    "SELECT * FROM tb_user WHERE username='" +
    username +
    "' AND password='" +
    hashpw(password) +
    "'";
  let query = conn.query(sql, (err, results) => {
    //res.redirect("/");
    const hasil = hashresult(results.toString());
    res.json({ result: "1", data: results });
  });
});

app.get("/getdetail/:username", (req, res) => {
  let username = req.params.username;
  let q1 =
    "SELECT COUNT(*) AS jumlah_followers FROM tb_followers a JOIN tb_user b ON a.id_konsumen=b.id_konsumen WHERE b.username='" +
    username +
    "'";
  let query = conn.query(q1, (err, followers) => {
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
  let query = conn.query(sql, (err, results) => {
    //res.redirect("/");
    //const hasil = hashresult(results.toString());
    res.json({ result: "1", data: results });
  });
});

//server listening
app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});