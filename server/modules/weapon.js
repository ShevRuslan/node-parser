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
      array.push(res);
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
        let isStatTrack = false;
        let isSouvenir = false;
        if (arrayNameWeapon[0].split(' ')[0] == "StatTrak™" || arrayNameWeapon[0].split(' ')[1] == "StatTrak™") isStatTrack = true;
        if (arrayNameWeapon[0].split(' ')[0] == "Souvenir") isSouvenir = true;
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
            'isStatTrak': isStatTrack,
            'isSouvenir': isSouvenir,
            'type': domen.type,
            'type_weapon': domen.type_weapon
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
  getStattrackWeapon = async (request, response) => {
    const items = await Weapon.find({ isStatTrak: true });
    response.status(200).json({'items': items});
  }
  getSouvenirWeapon = async (request, response) => {
    const items = await Weapon.find({ isSouvenir: true });
    response.status(200).json({'items': items});
  }
  getWeapon = async (request, response) => {
    const items = await Weapon.find({ isStatTrak: false, isSouvenir: false, type: 'weapon' }, null, {sort: {'percentage-market-autobuy': -1}}).limit(100);
    response.status(200).json({'items': items});
  }
  getKnife = async (request, response) => {
    const items = await Weapon.find({ type: 'knife' });
    response.status(200).json({ 'items': items });
  }
  getGloves = async (request, response) => {
    const items = await Weapon.find({ type: 'gloves' });
    response.status(200).json({ 'items': items });
  }
  searchByName = async (request, response) => {
    const {name} = request.query;
    const items = await Weapon.find({ name: { $regex: name, $options: 'i' } }, null, {sort: {'percentage-market-autobuy': -1}}).limit(100);
    response.status(200).json({ 'items': items });
  }
  searchBetweenPrice = async (request, response) => {
    const minPrice = request.body.minPrice;
    const maxPrice = request.body.maxPrice;
    try {
      const items = await Weapon.find({ price: { $gte:minPrice, $lte: maxPrice } });
      response.status(200).json({items: items});
    } catch (err) {
      response.status(404).json({ message: err });
    }
  }
};