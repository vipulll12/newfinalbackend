const express = require("express");
const { Auth, isAdmin } = require("../middleware/Auth");
const router = express.Router();

const cardsController = require("../controller/serviceCard");

router.post("/",  cardsController.createCard);
router.get("/", cardsController.getAllCards);
router.get("/:id", cardsController.getCardById);
router.put("/:id",  cardsController.updateCardById);
router.delete("/:id",  cardsController.deleteCardById);
router.delete("/", cardsController.deleteAllCards);


module.exports = router;
