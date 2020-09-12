const Weapon = require('./models/weapons');
const axios = require('axios');
const config = require('./config/');
const Currency = require('./currency.js');

class Update {

  obj = {}
  currency = new Currency();
  
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
        continue;
      }
      const items = await response.data.items;
      itemsParePage = await response.data.pageItems;
      let count = await response.data.count;
      let filteredItems = await items.filter((item) => {
        let oldItemIndex = this.obj[domen.link].map[item.id];
        let oldItem = this.obj[domen.link].items[oldItemIndex];
        if (!oldItem) return true;
        return (item.price !== oldItem.price || item['price-steam'] !== oldItem['price-steam'] || item['price-autobuy'] !== oldItem['price-autobuy']);
      })
      console.log(`Current link: ${currentLink}, PageLink: ${pageLink} PageItems:${itemsParePage}, Count: ${count}, Domen: ${domen.link}`);
      console.log(filteredItems);
      for await (let item of filteredItems) {
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
          exsistItem['priceCYN'] = item['price'];
          exsistItem['price'] = item['price'];
          exsistItem['priceRUB'] = (await this.changeValue(item['price'], "CNY", "RUB")).toFixed(3);
          exsistItem['priceUSD'] = (await this.changeValue(item['price'], "CNY", "USD")).toFixed(3);
          exsistItem['price-steam'] = item['price-steam'];
          exsistItem['price-steam-CNY'] = item['price-steam'];
          exsistItem['price-steam-RUB'] = (await this.changeValue(item['price-steam'], "CNY", "RUB")).toFixed(3);
          exsistItem['price-steam-USD'] = (await this.changeValue(item['price-steam'], "CNY", "USD")).toFixed(3);
          exsistItem['price-autobuy'] = item['price-autobuy'];
          exsistItem['price-autobuy-CNY'] = item['price-autobuy'];
          exsistItem['price-autobuy-RUB'] = (await this.changeValue(item['price-autobuy'], "CNY", "RUB")).toFixed(3);
          exsistItem['price-autobuy-USD'] = (await this.changeValue(item['price-autobuy'], "CNY", "USD")).toFixed(3);;
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
            'priceCNY': item.price,
            'priceRUB': (await this.changeValue(item.price, "CNY", "RUB")).toFixed(3),
            'priceUSD': (await this.changeValue(item.price, "CNY", "USD")).toFixed(3),
            'price-steam': item['price-steam'],
            'price-steam-CNY': item['price-steam'],
            'price-steam-RUB': (await this.changeValue(item['price-steam'], "CNY", "RUB")).toFixed(3),
            'price-steam-USD':(await this.changeValue(item['price-steam'], "CNY", "USD")).toFixed(3),
            'price-autobuy': item['price-autobuy'],
            'price-autobuy-CNY': item['price-autobuy'],
            'price-autobuy-RUB': (await this.changeValue(item['price-autobuy'], "CNY", "RUB")).toFixed(3),
            'price-autobuy-USD': (await this.changeValue(item['price-autobuy'], "CNY", "USD")).toFixed(3),
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
      }
      // filteredItems.forEach(async item => {
      //   if (!this.obj[domen.link].map[item.id]) {
      //     this.obj[domen.link].map[item.id] = this.obj[domen.link].items.length;
      //     this.obj[domen.link].items.push(item) 
      //   }
      //   else {
      //     this.obj[domen.link].items[this.obj[domen.link].map[item.id]] = item;
      //   }
      //   let arrayNameWeapon = item.name.split('|')
      //   let additional_type = 'Normal';
      //   if (arrayNameWeapon[0].split(' ')[0] == "StatTrak™" || arrayNameWeapon[0].split(' ')[1] == "StatTrak™") {
      //     additional_type = 'StatTrak'
      //   }
      //   if (arrayNameWeapon[0].split(' ')[0] == "Souvenir") {
      //     additional_type = 'Souvenir'
      //   }
      //   const exsistItem = await Weapon.findOne({ 'id': item.id });
      //   if (exsistItem) {
      //     exsistItem['priceCYN'] = item['price'];
      //     exsistItem['price'] = item['price'];
      //     exsistItem['priceRUB'] = (await this.changeValue(item['price'], "CNY", "RUB")).toFixed(3);
      //     exsistItem['priceUSD'] = (await this.changeValue(item['price'], "CNY", "USD")).toFixed(3);
      //     exsistItem['price-steam'] = item['price-steam'];
      //     exsistItem['price-steam-CNY'] = item['price-steam'];
      //     exsistItem['price-steam-RUB'] = (await this.changeValue(item['price-steam'], "CNY", "RUB")).toFixed(3);
      //     exsistItem['price-steam-USD'] = (await this.changeValue(item['price-steam'], "CNY", "USD")).toFixed(3);
      //     exsistItem['price-autobuy'] = item['price-autobuy'];
      //     exsistItem['price-autobuy-CNY'] = item['price-autobuy'];
      //     exsistItem['price-autobuy-RUB'] = (await this.changeValue(item['price-autobuy'], "CNY", "RUB")).toFixed(3);
      //     exsistItem['price-autobuy-USD'] = (await this.changeValue(item['price-autobuy'], "CNY", "USD")).toFixed(3);;
      //     exsistItem['percentage-market-steam'] = item['percentage-market-steam'];
      //     exsistItem['percentage-market-autobuy'] = item['percentage-market-autobuy'];
      //     try {
      //       await exsistItem.save();
      //     }
      //     catch (err) {
      //       console.log(err);
      //     }
      //   }
      //   else {
      //     let newItem = new Weapon({
      //       'id': item.id,
      //       'name': item.name,
      //       'price': item.price,
      //       'priceCNY': item.price,
      //       'priceRUB': (await this.changeValue(item.price, "CNY", "RUB")).toFixed(3),
      //       'priceUSD': (await this.changeValue(item.price, "CNY", "USD")).toFixed(3),
      //       'price-steam': item['price-steam'],
      //       'price-steam-CNY': item['price-steam'],
      //       'price-steam-RUB': (await this.changeValue(item['price-steam'], "CNY", "RUB")).toFixed(3),
      //       'price-steam-USD':(await this.changeValue(item['price-steam'], "CNY", "USD")).toFixed(3),
      //       'price-autobuy': item['price-autobuy'],
      //       'price-autobuy-CNY': item['price-autobuy'],
      //       'price-autobuy-RUB': (await this.changeValue(item['price-autobuy'], "CNY", "RUB")).toFixed(3),
      //       'price-autobuy-USD': (await this.changeValue(item['price-autobuy'], "CNY", "USD")).toFixed(3),
      //       'percentage-market-steam': item['percentage-market-steam'],
      //       'percentage-market-autobuy': item['percentage-market-autobuy'],
      //       'link': item['link'],
      //       'type': domen.type,
      //       'type_weapon': domen.type_weapon,
      //       'additional_type': additional_type,
      //     });
      //     try {
      //       await newItem.save();
      //     }
      //     catch (err) {
      //       console.log(err);
      //     }
      //   }
      // })
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
    timer = setTimeout(() => this.update(domen), 0);
  }
  changeValue = async (oldPrice, oldValute, newValute)  => {
    const currencyValute = await this.currency.getCurrency();
    let currentCurrency = currencyValute[oldValute];
    let newValueInRUB = oldPrice * currentCurrency.Value;
    if (newValute != 'RUB') {
      let newValueInNewCurrency = newValueInRUB / currencyValute[newValute].Value;
      return newValueInNewCurrency; 
    }
    else {
      return newValueInRUB;
    }
  }
}

module.exports = Update;