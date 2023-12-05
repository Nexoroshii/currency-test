const mongoose = require("mongoose");

const exchangeRateSchema = new mongoose.Schema({
  isSuccessfully: { type: String, required: false },
  date: { type: Date, required: true },
  data: { type: Array, required: true },
  changeDescription: { type: String, required: false },
  crc32: { type: Number, required: true },
});

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

module.exports = ExchangeRate;
