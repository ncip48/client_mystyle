var express = require("express");
var router = express.Router();

router.post("/", function(req, res, next) {
    res.json({result:'1', data: {username : req.body.username, password: req.body.password}});
    console.log(req.body);
});

module.exports = router;