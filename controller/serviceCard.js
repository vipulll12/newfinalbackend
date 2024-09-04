const Card = require("../model/ServiceCardModel");
require("dotenv").config();

exports.createCard = async (req, res) => {
  try {
    const { title, description, imageUrl,data,category,type } = req.body;
    const card = new Card({ title, description, imageUrl,data,category,type });
    await card.save();
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCards = async (req, res) => {
  try {
    const type = req.query.type;
  
    const cards = await Card.find({type});
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCardById = async (req, res) => {
  try {
    const { title, description, imageURL, data,category,type} = req.body;
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { title, description, imageURL,data,category,type },
      { new: true }
    );
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCardById = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAllCards = async (req, res) => {
  try {
    await Card.deleteMany({}); // Delete all cards
    res.status(200).json({ message: "All cards deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
