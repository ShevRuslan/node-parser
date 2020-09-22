const Weapon = require("./models/weapons");
const axios = require("axios");
const config = require("./config/");
const Currency = require("./currency.js");

class Update {
  obj = {};
  objCurrency = {};
  updateTm = false;
  init = async currency => {
    currency = new Currency();
    const hasCurrency = await currency.init();
    if (Object.keys(this.objCurrency).length === 0 && this.objCurrency.constructor === Object && hasCurrency) {
      this.objCurrency = currency.getCurrency();
    }
    const domens = config.domens;
    this.updatesBuff(domens['buff']);
  };
  updatesTM = () => {
    const domens = config.domens['csgotm'];
    for (let domen of domens) {
      this.obj[domen.link] = { map: {}, items: [] };
      this.updateTM(domen);
    }
  }
  updatesBuff = async domens => {
    let currentIndex = 1;
    let countDomens = domens.length;
    for (let domen of domens) {
      this.obj[domen.link] = { map: {}, items: [] };
      this.updateBuff(domen, currentIndex, countDomens);
      currentIndex++;
    }
  }
  updateTM = async (domen) => {
    let timer = null;
    let response = null;
    try {
      response = await axios.get(`http://${domen.link}/api/getWeapon/1`);
      let items = response.data.items;
  
  
      console.log(this.obj[domen.link].items.length, items.length);
  
      //Элементы, которых нет в парсинге - их нужно соответственно удалять из кэша и менять цену в бд.
      const results = this.obj[domen.link].items.filter(({ 'market_hash_name': id1 }) => !items.some(({ 'market_hash_name': id2 }) => id2 === id1));
     //удаляем эти элементы и удаляем из бд
      this.obj[domen.link].items = this.obj[domen.link].items.filter(ar => !results.find(rm => {
        if (rm['market_hash_name'] === ar['market_hash_name']) {
          Weapon.findOne({ name: rm['market_hash_name'] }, (err, weapon) => {
            if (weapon != null) {
              weapon['price-csgotm-CNY'] = null;
              weapon['price-csgotm-RUB'] = null;
              weapon['price-csgotm-USD'] = null; 
              try {
                weapon.save();
              }
              catch (err) {
                console.log(err);
              }
            }
          })
          return true;
        }
     }));
      console.log(this.obj[domen.link].items.length);

      this.obj[domen.link].map = {};

      this.obj[domen.link].items.forEach((item, index) => {
        this.obj[domen.link].map[item.market_hash_name] = index;
      })
      
      
      let filteredItems = await items.filter(item => {
        let oldItemIndex = this.obj[domen.link].map[item.market_hash_name];//Берем индекс в массиве
        let oldItem = this.obj[domen.link].items[oldItemIndex]; //Берем сам айтем
        if (!oldItem) return true; // если его нет - добавляем
        return (item.price !== oldItem.price); // если цены нет - добавляем
      });
  
      console.log(`----------------------------CSGOTM NEW ITEMS: ${filteredItems.length}`)
      
      filteredItems.forEach(async item => {
        if (!this.obj[domen.link].map[item.market_hash_name]) {
          this.obj[domen.link].map[item.market_hash_name] = this.obj[domen.link].items.length;
          this.obj[domen.link].items.push(item);
        } else {
          this.obj[domen.link].items[this.obj[domen.link].map[item.market_hash_name]] = item;
        }
        const exsistItem = await Weapon.findOne({ name: item.market_hash_name });
        if (exsistItem) {
          exsistItem['price-csgotm-RUB'] = parseFloat(item.price);
          exsistItem['price-csgotm-CNY'] = (await this.changeValue(parseFloat(item.price), "RUB", "CNY")).toFixed(3);
          exsistItem['price-csgotm-USD'] = (await this.changeValue(parseFloat(item.price), "RUB", "USD")).toFixed(3);
          try {
           await exsistItem.save();
          }
          catch (err) {
            console.log(err);
          }
        }
      })
    } catch (err) {
      console.log(err);
    }
    
    timer = setTimeout(() => this.updateTM(domen), 0);
  }
  updateBuff = async (domen, currentIndex, countDomens) => {
    let timer = null;
    clearTimeout(timer);
    let currentLink = 1;
    let currentPage = 1;
    let sendRequest = true;
    let pageLink = 80;
    let itemsParePage = 100;

    while (sendRequest) {
      let response = null;
      try {
        if (currentPage == 1 && currentLink == 0) currentLink = 1;
        response = await axios.get(`http://${domen.link}/api/getWeapon/${currentPage}?currentLink=${currentLink}`);
      } catch (err) {
        console.log(err);
        continue;
      }

      const items = await response.data.items;

      if (items.length == 0) continue;

      itemsParePage = await response.data.pageItems;
      let count = await response.data.count;

      let filteredItems = await items.filter(item => {
        let oldItemIndex = this.obj[domen.link].map[item.id];
        let oldItem = this.obj[domen.link].items[oldItemIndex];
        if (!oldItem) return true;
        return (
          item.price !== oldItem.price ||
          item["price-steam"] !== oldItem["price-steam"] ||
          item["price-autobuy"] !== oldItem["price-autobuy"]
        );
      });

      console.log(`Current link: ${currentLink}, PageLink: ${pageLink} PageItems:${itemsParePage}, Count: ${count}, Domen: ${domen.link}`);

      filteredItems.forEach(async item => {
        if (!this.obj[domen.link].map[item.id]) {
          this.obj[domen.link].map[item.id] = this.obj[domen.link].items.length;
          this.obj[domen.link].items.push(item);
        } else {
          this.obj[domen.link].items[this.obj[domen.link].map[item.id]] = item;
        }
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
        const exsistItem = await Weapon.findOne({ $or: [{ 'id': item.id }, { 'name': item.name }] });
        if (exsistItem) {
          exsistItem["price-buff-CNY"] = item.price;
          exsistItem["price-buff-RUB"] = (await this.changeValue(item.price, "CNY", "RUB")).toFixed(3);
          exsistItem["price-buff-USD"] = (await this.changeValue(item.price, "CNY", "USD") ).toFixed(3);
          exsistItem["price-steam-CNY"] = item["price-steam"];
          exsistItem["price-steam-RUB"] = (await this.changeValue(item["price-steam"], "CNY", "RUB")).toFixed(3);
          exsistItem["price-steam-USD"] = (await this.changeValue(item["price-steam"], "CNY", "USD")).toFixed(3);
          exsistItem["price-autobuy-CNY"] = item["price-autobuy"];
          exsistItem["price-autobuy-RUB"] = (await this.changeValue(item["price-autobuy"], "CNY", "RUB")).toFixed(3);
          exsistItem["price-autobuy-USD"] = (await this.changeValue(item["price-autobuy"], "CNY", "USD")).toFixed(3);
          exsistItem['id'] = item.id;
          exsistItem['link'] = item.link;
          exsistItem['type'] = domen.type;
          exsistItem['type_weapon'] = domen.type_weapon;
          exsistItem['additional_type'] = additional_type;
          try {
            await exsistItem.save();
          } catch (err) {
            console.log(err);
          }
        } else {
          let newItem = new Weapon({
            id: item.id,
            name: item.name,
            "price-buff-CNY": item.price,
            "price-buff-RUB": (await this.changeValue(item.price, "CNY", "RUB")).toFixed(3),
            "price-buff-USD": (await this.changeValue(item.price, "CNY", "USD")).toFixed(3),
            "price-steam-CNY": item["price-steam"],
            "price-steam-RUB": ( await this.changeValue(item["price-steam"], "CNY", "RUB") ).toFixed(3),
            "price-steam-USD": ( await this.changeValue(item["price-steam"], "CNY", "USD")).toFixed(3),
            "price-autobuy-CNY": item["price-autobuy"],
            "price-autobuy-RUB": (await this.changeValue(item["price-autobuy"], "CNY", "RUB")).toFixed(3),
            "price-autobuy-USD": (await this.changeValue(item["price-autobuy"], "CNY", "USD")).toFixed(3),
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
        if (currentIndex == countDomens && this.updateTm == false) {
          this.updateTm = true;
          this.updatesTM();
        }
        sendRequest = false;
      }
      if (
        (((currentPage - 1) * itemsParePage) / 10 + currentLink) * 10 ==
        count
      ) {
        currentLink = 1;
        if (currentIndex == countDomens && this.updateTm == false) {
          this.updateTm = true;
          this.updatesTM();
        }
        sendRequest = false;
      }

      if (currentPage != 1) currentLink--;
      currentLink++;
    }
    timer = setTimeout(() => this.updateBuff(domen), 0);
    return true;
  };
  changeValue = async (oldPrice, oldValute, newValute) => {
    const currencyValute = await this.objCurrency;
    if (oldValute == 'RUB') {
      let newValue = currencyValute[newValute];
      let newValueInNewCurrency = oldPrice / newValue.Value;
      return newValueInNewCurrency;
    }
    else {
      let currentCurrency = currencyValute[oldValute];
      let newValueInRUB = oldPrice * currentCurrency.Value;
      if (newValute != "RUB") {
        let newValueInNewCurrency =
          newValueInRUB / currencyValute[newValute].Value;
        return newValueInNewCurrency;
      } else {
        return newValueInRUB;
      }
    }
  };
}

module.exports = Update;
