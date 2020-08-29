const Weapon = require('../models/weapons');
const axios = require('axios');
const config = require('../config/');

module.exports = class {

  getInfo = async (request, response) => {
    const domens = config.domens;
    let res = null;
    for await (let domen of domens) {
      res = await this.requestWeapon(domen);
    }
    response.status(200).json({'status': res});
  }; 
  requestWeapon = async (domen) => {
    const res = await axios.get(`http://${domen.link}/api/getWeapon/1?currentLink=1`);
    const items = await res.data.items;
    items.forEach(async item => {
      let arrayNameWeapon = item.name.split('|')
      let isStatTrack = false;
      if (arrayNameWeapon[0].split(' ')[0] == "StatTrak™" || arrayNameWeapon[0].split(' ')[1] == "StatTrak™") isStatTrack = true;
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
        'type': domen.type,
        'type_weapon': domen.type_weapon
      });
      try {
        const saveItem = await newItem.save();
      }
      catch (err) {
        console.log(err);
      }
    })
    return 'success';
  }
};