const mongoose = require("mongoose");

const serviceCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  category:{
    type:String,
    required: true,
  },
  type:{
    type:String,
  },

  data:{
    type:String
  }
});

const ServiceCard = mongoose.model("ServiceCard", serviceCardSchema);

module.exports = ServiceCard;
