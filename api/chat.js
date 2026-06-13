const express = require("express");
const router = express.Router();
const { chatBot } = require("../controller/chatController");

router.post("/", chatBot);

module.exports = router;