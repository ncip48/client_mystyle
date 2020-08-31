var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
    res.json({result:'1', message: "API is working properly"});
});

module.exports = router;