const Weapon = require('./models/weapons');
const axios = require('axios');
const config = require('./config/');


class Update {

  obj = {}

  init = () =>{
    const domens = config.domens;
    for (let domen of domens) {
      this.obj[domen.link] = { map: {}, items: [] };
      this.update(domen);
    }
  }
  update = async (domen) => {
    let timer = null;
    clearTimeout(timer);
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
      let filteredItems = await items.filter((item) => {
        let oldItemIndex = this.obj[domen.link].map[item.id];
        let oldItem = this.obj[domen.link].items[oldItemIndex];
        if (!oldItem) return true;
        return item.price !== oldItem.price;
      })
      console.log(`Current link: ${currentLink}, PageLink: ${pageLink} PageItems:${itemsParePage}, Count: ${count}, Domen: ${domen.link}`);
      filteredItems.forEach(async item => {
        if (!this.obj[domen.link].map[item.id]) {
          this.obj[domen.link].map[item.id] = this.obj[domen.link].items.length;
          this.obj[domen.link].items.push(item) 
        }
        else {
          this.obj[domen.link].items[this.obj[domen.link].map[item.id]] = item;
        }
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
    setTimeout(() => this.update(domen), 1000);
  }
}

module.exports = Update;