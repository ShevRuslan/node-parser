const axios = require('axios');
module.exports = class {
  //Храним объект с основной валютой
  currency = {
    'USD': {},
    'CNY': {},
  }
  //Инициализация
  init = () => {
    return this.requestCurrency();
  }
  //Запрос на стороннее апи
  requestCurrency = async () => {
    const response = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
    const valute = response.data.Valute;
    this.currency['USD'] = valute['USD'];
    this.currency['CNY'] = valute['CNY'];
    return true;
  }
  //Функция для возвращения валют.
  getCurrency = async () => {
    return this.currency;
  }
}