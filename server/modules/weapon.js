const Weapon = require('../models/weapons');
const axios = require('axios');
const config = require('../config/');

module.exports = class {

  getInfo = async (request, response) => {
    const array = []
    const domens = config.domens;
    let res = null;
    for await (let domen of domens) {
      res = await this.requestWeapon(domen);
      array.push({domen, res});
      console.log({ domen, res });
    }
    response.status(200).json({'status': array});
  }; 
  requestWeapon = async (domen) => {
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
        response = await axios.get(`http://${domen.link}/api/getWeapon/${currentPage}?currentLink=${currentLink}`);
      }
      catch(err) {
        console.log(err)
      }
      const items = await response.data.items;
      itemsParePage = await response.data.pageItems;
      let count = await response.data.count;
      console.log(`Current link: ${currentLink}, PageLink: ${pageLink} PageItems:${itemsParePage}, Count: ${count}`);
      items.forEach(async item => {
        let arrayNameWeapon = item.name.split('|')
        let additional_type = 'Normal';
        if (arrayNameWeapon[0].split(' ')[0] == "StatTrak™" || arrayNameWeapon[0].split(' ')[1] == "StatTrak™") {
          additional_type = 'StatTrak'
        }
        if (arrayNameWeapon[0].split(' ')[0] == "Souvenir") {
          additional_type = 'Souvenir'
        }
        const exsistItem = await Weapon.findOne({ 'id': item.id });
        if (exsistItem) {
          exsistItem['price'] = item['price'];
          exsistItem['price-steam'] = item['price-steam'];
          exsistItem['price-autobuy'] = item['price-autobuy'];
          exsistItem['percentage-market-steam'] = item['percentage-market-steam'];
          exsistItem['percentage-market-autobuy'] = item['percentage-market-autobuy'];
          try {
            await exsistItem.save();
          }
          catch (err) {
            console.log(err);
          }
        }
        else {
          let newItem = new Weapon({
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'price-steam': item['price-steam'],
            'price-autobuy': item['price-autobuy'],
            'percentage-market-steam': item['percentage-market-steam'],
            'percentage-market-autobuy': item['percentage-market-autobuy'],
            'link': item['link'],
            'type': domen.type,
            'type_weapon': domen.type_weapon,
            'additional_type': additional_type,
          });
          try {
            await newItem.save();
          }
          catch (err) {
            console.log(err);
          }
        }
      })
      if (currentLink * pageLink == itemsParePage) {
        currentLink = 0;
        sendRequest = false;
      }
      if ((((currentPage - 1) * itemsParePage) / 10 + currentLink) * 10 == count) {
        currentLink = 1;
        sendRequest = false;
      }

      if (currentPage != 1) currentLink--;
      currentLink++;
    }
    return arrayPages;
  }

  getWeapon = async (request, response) => {
    const { type, type_weapon, minPrice, maxPrice, textSearch, offset = 0 } = request.query;
    const normallyTypeArray = JSON.parse(type);
    const normallyTypeWeaponArray = JSON.parse(type_weapon)

    let arrayTypeWeapon = []
    normallyTypeWeaponArray.forEach(item => {
      arrayTypeWeapon.push({ type: item.toLowerCase() });
    })

    let obj = []
    normallyTypeArray.forEach(item => {
      obj.push({ additional_type: item });
    })
    console.log(arrayTypeWeapon, obj);
    const items = await Weapon.find(
      {
        name: { $regex: textSearch, $options: 'i' },
        $and: [{$or: arrayTypeWeapon}, {$or: obj}],
        price: { $gte: minPrice, $lte: maxPrice }
      }, null, { sort: { 'percentage-market-autobuy': -1 } }).skip(parseInt(offset)).limit(100);
    response.status(200).json({'items': items});
  }
};