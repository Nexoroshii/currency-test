class logger {
  logRequest(date, code = "") {
    console.log(
      `Request received for status of exchange rates on date: ${date}`,
      code > 0 ? `for currency with code ${code}` : ""
    );
  }

  logResponseSuccess(successString) {
    console.log("Response sent:", successString);
  }
  logResponse(currencyData, changeDescription) {
    console.log("Response sent:", currencyData, changeDescription);
  }
}

module.exports = new logger();
