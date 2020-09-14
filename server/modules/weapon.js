const Weapon = require("../models/weapons");
const axios = require("axios");
const config = require("../config/");
const Currency = require('../currency.js');
module.exports = class {
  getInfo = async (request, response) => {
    const array = [];
    const domens = config.domens;
    let res = null;
    for await (let domen of domens) {
      res = await this.requestWeapon(domen);
      array.push({ domen, res });
      console.log({ domen, res });
    }
    response.status(200).json({ status: array });
  };
  getCountWeapons = async (request, response) => {
    const count = await Weapon.countDocuments();
    response.status(200).json({ count: count });
  }
  requestWeapon = async domen => {
    let arrayPages = [];
    let currentLink = 1;
    let currentPage = 1;
    let sendRequest = true;
    let pageLink = 80;
    let itemsParePage = 100;
    while (sendRequest) {
      let response = null;
      try {
        if (currentPage == 1 && currentLink == 0) currentLink = 1;
        arrayPages.push(currentLink);
        response = await axios.get(
          `http://${domen.link}/api/getWeapon/${currentPage}?currentLink=${currentLink}`
        );
      } catch (err) {
        console.log(err);
      }
      const items = await response.data.items;
      itemsParePage = await response.data.pageItems;
      let count = await response.data.count;
      console.log(
        `Current link: ${currentLink}, PageLink: ${pageLink} PageItems:${itemsParePage}, Count: ${count}`
      );
      items.forEach(async item => {
        let arrayNameWeapon = item.name.split("|");
        let additional_type = "Normal";
        if (
          arrayNameWeapon[0].split(" ")[0] == "StatTrak™" ||
          arrayNameWeapon[0].split(" ")[1] == "StatTrak™"
        ) {
          additional_type = "StatTrak";
        }
        if (arrayNameWeapon[0].split(" ")[0] == "Souvenir") {
          additional_type = "Souvenir";
        }
        const exsistItem = await Weapon.findOne({ id: item.id });
        if (exsistItem) {
          exsistItem["price"] = item["price"];
          exsistItem["price-steam"] = item["price-steam"];
          exsistItem["price-autobuy"] = item["price-autobuy"];
          exsistItem["percentage-market-steam"] =
            item["percentage-market-steam"];
          exsistItem["percentage-market-autobuy"] =
            item["percentage-market-autobuy"];
          try {
            await exsistItem.save();
          } catch (err) {
            console.log(err);
          }
        } else {
          let newItem = new Weapon({
            id: item.id,
            name: item.name,
            price: item.price,
            "price-steam": item["price-steam"],
            "price-autobuy": item["price-autobuy"],
            "percentage-market-steam": item["percentage-market-steam"],
            "percentage-market-autobuy": item["percentage-market-autobuy"],
            link: item["link"],
            type: domen.type,
            type_weapon: domen.type_weapon,
            additional_type: additional_type
          });
          try {
            await newItem.save();
          } catch (err) {
            console.log(err);
          }
        }
      });
      if (currentLink * pageLink == itemsParePage) {
        currentLink = 0;
        sendRequest = false;
      }
      if (
        (((currentPage - 1) * itemsParePage) / 10 + currentLink) * 10 ==
        count
      ) {
        currentLink = 1;
        sendRequest = false;
      }

      if (currentPage != 1) currentLink--;
      currentLink++;
    }
    return arrayPages;
  };

  getWeapon = async (request, response) => {
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
    const serviceFirstField = this.getService(serviceFirst, valute);
    const serviceSecondField = this.getService(serviceSecond, valute);
    const serviceFirstFieldNotValute = this.getService(serviceFirst);
    const serviceSecondFieldNotValute = this.getService(serviceSecond);
    console.log(serviceFirstFieldNotValute, serviceSecondFieldNotValute);
    try {
      items = await Weapon.find(
        {
          name: { $regex: textSearch, $options: "i" },
          $and: [{ $or: arrayTypeWeapon }, { $or: obj }],
          [serviceFirstField]: { $gte: minPrice, $lte: maxPrice, $ne: 0 }
        },
      )
        .limit(20000);
    } catch (err) {
      console.log(err);
    }
    items.forEach(item => {
      item['percent'] = this.getPercentage(item[serviceFirstFieldNotValute], item[serviceSecondFieldNotValute], serviceSecond).toFixed(2);;
      item['price-first'] = item[serviceFirstField];
      item['price-second'] = item[serviceSecondField];
    });
    items.sort((a, b) => (a.percent > b.percent) ? -1 : 1)
    const newItems = items.slice(parseInt(offset), parseInt(offset) + 100);
    console.log(offset);
    response.status(200).json({ items: newItems });
  };
  getPercentage(value1, value2, serviceCommission) {
    //x - цена сервиса 1
    //y - цена сервиса 2
    //z - процент сервиса 2
    //100*(((X*(100-Z)/100)/Y)-1)
    let objСommission = {
      'buff.163 min price': 2.5,
      'buff.163 autobuy': 2.5,
      "steam min price": 13
    }
    const commission = objСommission[serviceCommission];
    return 100 * (((value2 * (100 - commission) / 100) / value1) - 1);
  }
  getService(service, valute = null) {
    if (valute != null) {
      switch (service) {
        case 'buff.163 min price':
          return `price-buff-${valute}`;
        case 'buff.163 autobuy':
          return `price-autobuy-${valute}`;
        case 'steam min price':
          return `price-steam-${valute}`
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
      }
    }
  }
};
