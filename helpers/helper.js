function getApiURL(date) {
  const apiUrl = `https://www.nbrb.by/api/exrates/rates?ondate=${date}&periodicity=0`;
  return apiUrl;
}

function getPreviousDate(date) {
  const previousDate = new Date(
    Date.parse(date) - new Date().getTimezoneOffset() * 60000
  );

  previousDate.setDate(previousDate.getDate() - 1);
  return previousDate.toISOString().split("T")[0];
}

module.exports = { getApiURL, getPreviousDate };
