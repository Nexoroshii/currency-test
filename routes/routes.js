const express = require("express");
const controller = require("../controllers/controller");

const router = express.Router();

// Endpoint 1: Загрузка данных о курсах за выбранную дату
router.get("/get_exchange_rate", controller.getCurrenciesOnDate);

// Endpoint 2: Информация о курсе валюты за указанный день
router.get("/get_currency_rate", controller.getOneCurrencyOnDate);

module.exports = router;
