const Weapon = require("../models/weapons");
const Currency = require('../currency.js');
module.exports = class {
  getWeapon = async (request, response) => {
    //Получение данных с фронта
    const {
      type,
      type_weapon,
      minPrice,
      maxPrice,
      textSearch,
      valute,
      serviceFirst,
      serviceSecond,
      offset = 0
    } = request.query;
    const normallyTypeArray = JSON.parse(type);

    const normallyTypeWeaponArray = JSON.parse(type_weapon);
    let arrayTypeWeapon = [];
    normallyTypeWeaponArray.forEach(item => {
      arrayTypeWeapon.push({ type: item.toLowerCase() });
    });

    let obj = [];
    if (normallyTypeArray.length == 0) {
      obj = [
        { additional_type: "StatTrak" },
        { additional_type: "Souvenir" },
        { additional_type: "Normal" }
      ];
    } else {
      normallyTypeArray.forEach(item => {
        obj.push({ additional_type: item });
      });
    }

    let items = null;
    const serviceFirstField = this.getService(serviceFirst, valute);//Получаем текущий сервис в бд по текущей валюте
    const serviceSecondField = this.getService(serviceSecond, valute);//Получаем текущий сервис в бд по текущей валюте
    const serviceFirstFieldNotValute = this.getService(serviceFirst);//Получаем текущий сервис в бд
    const serviceSecondFieldNotValute = this.getService(serviceSecond);//Получаем текущий сервис в бд
    console.log(serviceFirstField, serviceSecondField);
    try {
      //Ищем в бд
      items = await Weapon.find(
        {
          name: { $regex: textSearch, $options: "i" },
          $and: [{ $or: arrayTypeWeapon }, { $or: obj }],
          [serviceFirstField]: { $gte: minPrice, $lte: maxPrice, $ne: 0 },
          [serviceSecondField]: { $gte: minPrice, $lte: maxPrice, $ne: 0 }
        })
    } catch (err) {
      console.log(err);
    }
    //Проходим циклом по всем оружиям, у каждого считаем процент относительно двух сервисов, сортируем и возвращаем самые выгодные по оффсету.
    items.forEach(item => {
      item['percent'] = this.getPercentage(item[serviceFirstFieldNotValute], item[serviceSecondFieldNotValute], serviceSecond).toFixed(2);
      item['price-first'] = item[serviceFirstField];
      item['price-second'] = item[serviceSecondField];
    });
    items.sort((a, b) => (a.percent > b.percent) ? -1 : 1)
    const newItems = items.slice(parseInt(offset), parseInt(offset) + 100);
    console.log(offset);
    response.status(200).json({ items: newItems });
  };
  //Функция для получение процентов по двум значениям и сервисву
  getPercentage(value1, value2, serviceCommission) {
    //x - цена сервиса 1
    //y - цена сервиса 2
    //z - процент сервиса 2
    //100*(((X*(100-Z)/100)/Y)-1)
    let objСommission = {
      'buff.163 min price': 2.5,
      'buff.163 autobuy': 2.5,
      "steam min price": 13,
      "csgotm price": 7,
      "csgotm autobuy": 7,
    }
    const commission = objСommission[serviceCommission];
    return 100 * (((value2 * (100 - commission) / 100) / value1) - 1);
  }
  //Получение название сервиса по бд
  getService(service, valute = null) {
    if (valute != null) {
      switch (service) {
        case 'buff.163 min price':
          return `price-buff-${valute}`;
        case 'buff.163 autobuy':
          return `price-autobuy-${valute}`;
        case 'steam min price':
          return `price-steam-${valute}`
        case 'csgotm price':
            return `price-csgotm-${valute}`
        case 'csgotm autobuy':
          return `price-csgotm-autobuy-${valute}`
      } 
    }
    else {
      switch (service) {
        case 'buff.163 min price':
          return `price-buff-CNY`;
        case 'buff.163 autobuy':
          return `price-autobuy-CNY`;
        case 'steam min price':
          return `price-steam-CNY`
        case 'csgotm price':
          return `price-csgotm-CNY`
        case "csgotm autobuy":
          return `price-csgotm-autobuy-CNY`
      }
    }
  }
};