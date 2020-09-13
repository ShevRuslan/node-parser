const axios = require('axios');
module.exports = class {
  currency = {
    'USD': {},
    'CNY': {},
  }
  init = () => {
    return this.requestCurrency();
  }
  requestCurrency = async () => {
    const response = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
    const valute = response.data.Valute;
    this.currency['USD'] = valute['USD'];
    this.currency['CNY'] = valute['CNY'];
    return true;
  }
  getCurrency = async () => {
    return this.currency;
  }
}