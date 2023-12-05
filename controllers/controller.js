const axios = require("axios");
const crc32 = require("crc-32");
const ExchangeRate = require("../models/exchangeRate");
const errors = require("../messages/errors");
const messages = require("../messages/messages");
const helper = require("./../helpers/helper");
const logger = require("../middleware/logger");

const { getApiURL, getPreviousDate } = helper;

class controller {
  async getCurrenciesOnDate(req, res) {
    const date = req.query.date;
    logger.logRequest(date);
    if (!date) {
      return res.status(400).json({ error: errors.MISSING_DATE });
    }

    const apiUrl = getApiURL(date);

    try {
      const response = await axios.get(apiUrl);

      if (response.data.length === 0) {
        return res.status(404).json({ error: errors.NO_DATA });
      }

      // Вычисляем CRC32 и добавляем в заголовок ответа
      const crc = crc32.buf(response.data);
      res.header("X-CRC32", crc);

      // Сохраняем данные в базу данных
      const successString = `Currencies for ${date} have been successfully loaded`;
      const exchangeRate = new ExchangeRate({
        isSuccessfully: successString,
        date,
        data: response.data,
        crc32: crc,
      });
      await exchangeRate.save();

      logger.logResponseSuccess(successString);

      return res.json({
        isSuccessfully: successString,
      });
    } catch (error) {
      console.error(`${errors.CONNECTION_ERROR} ${error.message}`);

      return res.status(500).json({ error: errors.INTERNAL_ERROR });
    }
  }

  async getOneCurrencyOnDate(req, res) {
    const { date, currency } = req.query;

    if (!date || !currency) {
      return res.status(400).json({ error: errors.MISSING_DATE_CURRENCY });
    }
    logger.logRequest(date, currency);
    try {
      const response = await axios.get(getApiURL(date));

      if (response.data.length === 0) {
        return res.status(404).json({ error: errors.NO_DATA });
      }

      // Фильтрация данных для указанной валюты

      const currencyData = response.data.filter(
        (curr) => curr.Cur_ID == currency
      );

      if (!currencyData.length) {
        return res.status(404).json({ error: errors.CURRENCY_NOT_FOUND });
      }

      // Отправка запроса к API Национального банка за предыдущий день
      const previousDateResponse = await axios.get(
        getApiURL(getPreviousDate(date))
      );

      const previousCurrencyData = previousDateResponse.data.filter(
        (curr) => curr.Cur_ID == currency
      );

      // Определение изменения курса
      let changeDescription = messages.NO_DATA;

      if (previousCurrencyData) {
        const rateDifference =
          currencyData[0].Cur_OfficialRate -
          previousCurrencyData[0].Cur_OfficialRate;

        if (rateDifference > 0) {
          changeDescription = messages.RATE_INCREASED;
        } else if (rateDifference < 0) {
          changeDescription = messages.RATE_DECREASED;
        } else {
          changeDescription = messages.RATE_NOT_CHANGED;
        }
      }

      const crc = crc32.buf(JSON.stringify(currencyData));
      res.header("X-CRC32", crc);

      const exchangeRate = new ExchangeRate({
        date,
        data: currencyData,
        changeDescription: changeDescription,
        crc32: crc,
      });

      await exchangeRate.save();
      logger.logResponse(currencyData, changeDescription);

      return res.json({ data: currencyData, changeDescription });
    } catch (error) {
      console.error(`${errors.CONNECTION_ERROR}: ${error.message}`);

      return res.status(500).json({ error: errors.INTERNAL_ERROR });
    }
  }
}

module.exports = new controller();
