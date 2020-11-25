<template>
  <div class="fit">
    <q-table
      dense
      :data="getItems"
      :columns="columns"
      row-key="_id"
      hide-bottom
      :pagination="pagination"
      :rows-per-page-options="[0]"
      :loading="getLoading"
      separator="cell"
    >
      <template v-slot:body-cell-link="props">
        <q-td :props="props" @click="copyToBoard(props.row.name)" style="cursor:pointer" v-bind:class="{ 'bg-color': props.row['isColor'] }">
          <a :href="props.row.link" target="_blank">{{ props.row.name }}</a>
        </q-td>
      </template>
      <template v-slot:body-cell-price-first="props">
        <q-td :props="props" v-bind:class="{ 'bg-color': props.row['isColor'] }"> {{ props.row['price-first'] }} {{currencyChar}} </q-td>
      </template>
      <template v-slot:body-cell-price-second="props">
        <q-td :props="props" v-bind:class="{ 'bg-color': props.row['isColor'] }"> {{ props.row["price-second"] }} {{currencyChar}} </q-td>
      </template>
      <template v-slot:body-cell-percent="props">
        <q-td :props="props" v-bind:class="{ 'bg-color': props.row['isColor'] }">
          {{ props.row["percent"] }} %
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { mapActions } from "vuex";
import Api from "../service/api.js";
import { copyToClipboard } from 'quasar'
export default {
  data() {
    return {
      columns: [
        {
          name: "link",
          align: "left",
          label: "Ссылка",
          field: "link"
        },
        {
          name: "price-first",
          label: "Цена сервиса 1",
          field: "price-first",
          sortable: true
        },
        {
          name: "price-second",
          label: "Цена сервиса 2",
          field: "price-second",
          sortable: true
        },
        {
          name: "percent",
          label: "Процент",
          field: "percent",
          sortable: true
        },
      ],
      loading: true,
      data: [],
      pagination: {
        rowsPerPage: 0
      },
      timerUpdate: null,
      audio: null,
    };
  },
  computed: {
    // смешиваем результат mapGetters с внешним объектом computed
    ...mapGetters(["getItems", "getLoading", "getFilter", "getUpdateFilter", "getNotifyPercent", "getIsAudio"]),
    currencyChar() {
      let currencyChar = "¥";
      if(this.getUpdateFilter.valute == 'USD') currencyChar = "$";
      else if(this.getUpdateFilter.valute == 'RUB') currencyChar = "₽"
      return currencyChar;
    }
  },
  async created() {
    this.audio = new Audio();
    this.audio.src = "music.wav";
    const data = {
      type: JSON.stringify(this.getFilter.type),
      type_weapon: JSON.stringify(this.getFilter.type_weapon),
      minPrice: this.getFilter.minPrice,
      maxPrice: this.getFilter.maxPrice,
      offset: this.getFilter.offset,
      textSearch: this.getFilter.textSearch,
      valute: this.getFilter.valute.value,
      serviceFirst: this.getFilter.precentageServiceFirst,
      serviceSecond: this.getFilter.precentageServiceSecond,
    };
    this.changeUpdateFilter({
      type: this.getFilter.type,
      type_weapon: this.getFilter.type_weapon,
      minPrice: this.getFilter.minPrice,
      maxPrice: this.getFilter.maxPrice,
      offset: this.getFilter.offset,
      textSearch: this.getFilter.textSearch,
      valute: this.getFilter.valute.value,
      precentageServiceFirst: this.getFilter.precentageServiceFirst,
      precentageServiceSecond: this.getFilter.precentageServiceSecond,
    });
    const response = await Api.getWeapon(data);
    this.addItemsAfterSearch(response.items);
    this.data = response.items;
    this.changeLoading(false);
    this.update();
  },
  mounted() {
    this.scroll();
  },
  methods: {
    ...mapActions(["addItemsAfterSearch", "addItems"]),
    ...mapMutations(["changeLoading", "changeOffset", "changeUpdateFilter"]),
    copyToBoard(value) {
      copyToClipboard(value)
      .then(() => {
        this.$q.notify({
            message: 'Название оружия успешно скопирован в буфер обмена.',
            type: 'positive',
            caption: value,
            actions: [{ icon: 'close', color: 'white' }]
          });
      })
    },
    scroll() {
      window.onscroll = async () => {
        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight ===
          document.documentElement.offsetHeight;
        if (bottomOfWindow) {
          this.changeOffset(this.getFilter.offset + 100);
          const data = {
            type: JSON.stringify(this.getUpdateFilter.type),
            type_weapon: JSON.stringify(this.getUpdateFilter.type_weapon),
            minPrice: this.getUpdateFilter.minPrice,
            maxPrice: this.getUpdateFilter.maxPrice,
            offset: this.getFilter.offset,
            textSearch: this.getUpdateFilter.textSearch,
            valute: this.getUpdateFilter.valute,
            serviceFirst: this.getUpdateFilter.precentageServiceFirst,
            serviceSecond: this.getUpdateFilter.precentageServiceSecond,
          };
          const response = await Api.getWeapon(data);
          this.addItems(response.items);
          this.data = response.items;
          this.changeLoading(false);
        }
      };
    },
    filterArray(array) {
      let set = new Set();
      let uniqueArray = array.filter(item => {
        let exsist = set.has(item['_id']);
        if (exsist) return false;
        set.add(item['_id']);
        return item;
      });
      return uniqueArray;
    },
    updateMap(map, array) {
      array.forEach(el => map.set(el['_id'], el));
      return map;
    },
    mapToArray(map) {
      return [...map.values()];
    },
    updateItems(newItems, offset) {
      let isPrecent = false;
      let oldItems = [...this.getItems];
      newItems.forEach((item, index) => {
        if (this.getItems[offset + index] != undefined) {
          if(oldItems[offset + index].percent != item.percent) {
            item.isColor = true;
          }
          else {
            item.isColor = false;
          }
          oldItems[offset + index] = item;
          if(this.getNotifyPercent <= item.percent && isPrecent == false) isPrecent = true;

          if(this.getIsAudio && isPrecent) this.audio.play();
        }
      });
      return oldItems;
    },
    async update() {
      clearTimeout(this.timerUpdate);
      let localOffset = 0;
      while (true) {
        let map = new Map();
        map = this.updateMap(map, this.getItems);
        const data = {
          type: JSON.stringify(this.getUpdateFilter.type),
          type_weapon: JSON.stringify(this.getUpdateFilter.type_weapon),
          minPrice: this.getUpdateFilter.minPrice,
          maxPrice: this.getUpdateFilter.maxPrice,
          offset: localOffset,
          valute: this.getUpdateFilter.valute,
          textSearch: this.getUpdateFilter.textSearch,
          serviceFirst: this.getUpdateFilter.precentageServiceFirst,
          serviceSecond: this.getUpdateFilter.precentageServiceSecond,
        };
        const response = await Api.getWeapon(data);
        map = this.updateMap(map, response.items);
        let newItemsArray = this.mapToArray(map);

        const newItemsNow = this.updateItems(response.items, localOffset);
        let uniqueItems = this.filterArray(newItemsNow);
        this.addItemsAfterSearch(uniqueItems);
        if (localOffset == this.getFilter.offset) {
          localOffset = 0;
          this.timerUpdate = setTimeout(this.update, 3000);
          break;
        }
        localOffset = localOffset + 100;
      }
    }
  }
};
</script>

<style lang="scss">
  .bg-color {
    background-color: #c1f4cd!important;
  }
</style>
