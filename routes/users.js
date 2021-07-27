const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Hey welcome to users homepage");
});

module.exports = router;