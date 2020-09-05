<template>
  <div class="fit">
    <q-table
      dense
      title="Оружия"
      :data="getItems"
      :columns="columns"
      row-key="id"
      hide-bottom
      :pagination="pagination"
      :rows-per-page-options="[0]"
      :loading="getLoading"
    >
      <template v-slot:body-cell-link="props">
        <q-td :props="props">
          <a :href="props.row.link" target="_blank">{{ props.row.name }}</a>
        </q-td>
      </template>
      <template v-slot:body-cell-price="props">
        <q-td :props="props"> {{ props.row.price }} ¥ </q-td>
      </template>
      <template v-slot:body-cell-price-steam="props">
        <q-td :props="props"> {{ props.row["price-steam"] }} ¥ </q-td>
      </template>
      <template v-slot:body-cell-price-autobuy="props">
        <q-td :props="props"> {{ props.row["price-autobuy"] }} ¥ </q-td>
      </template>
      <template v-slot:body-cell-percentage-market-steam="props">
        <q-td :props="props">
          {{ props.row["percentage-market-steam"] }} %
        </q-td>
      </template>
      <template v-slot:body-cell-percentage-market-autobuy="props">
        <q-td :props="props">
          {{ props.row["percentage-market-autobuy"] }} %
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { mapActions } from "vuex";
import Api from "../service/api.js";
export default {
  data() {
    return {
      columns: [
        {
          name: "id",
          required: true,
          label: "id",
          field: "id",
          align: "left"
        },
        {
          name: "type_weapon",
          required: true,
          label: "Тип оружия",
          field: "type_weapon",
          align: "left"
        },
        {
          name: "link",
          align: "left",
          label: "Ссылка",
          field: "link"
        },
        {
          name: "price",
          label: "Цена",
          field: "price",
          sortable: true
        },
        {
          name: "price-steam",
          label: "Цена стима",
          field: "price-steam",
          sortable: true
        },
        {
          name: "price-autobuy",
          label: "Автопокупка",
          field: "price-autobuy",
          sortable: true
        },
        {
          name: "percentage-market-steam",
          label: "Процент 1",
          field: "percentage-market-steam",
          sortable: true
        },
        {
          name: "percentage-market-autobuy",
          label: "Процент 2",
          field: "percentage-market-autobuy",
          sortable: true
        }
      ],
      loading: true,
      data: [],
      pagination: {
        rowsPerPage: 0
      },
      timerUpdate: null
    };
  },
  computed: {
    // смешиваем результат mapGetters с внешним объектом computed
    ...mapGetters(["getItems", "getLoading", "getFilter", "getUpdateFilter"])
  },
  async created() {
    const data = {
      type: JSON.stringify(this.getFilter.type),
      type_weapon: JSON.stringify(this.getFilter.type_weapon),
      minPrice: this.getFilter.minPrice,
      maxPrice: this.getFilter.maxPrice,
      offset: this.getFilter.offset,
      textSearch: this.getFilter.textSearch,
      precentageItems: this.getFilter.precentageItems
    };
    this.changeUpdateFilter({
      type: this.getFilter.type,
      type_weapon: this.getFilter.type_weapon,
      minPrice: this.getFilter.minPrice,
      maxPrice: this.getFilter.maxPrice,
      offset: this.getFilter.offset,
      textSearch: this.getFilter.textSearch,
      precentageItems: this.getFilter.precentageItems
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
            precentageItems: this.getUpdateFilter.precentageItems
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
        let exsist = set.has(item.id);
        if (exsist) return false;
        set.add(item.id);
        return item;
      });
      return uniqueArray;
    },
    updateMap(map, array) {
      array.forEach(el => map.set(el.id, el));
      return map;
    },
    mapToArray(map) {
      return [...map.values()];
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
          textSearch: this.getUpdateFilter.textSearch,
          precentageItems: this.getUpdateFilter.precentageItems
        };
        const response = await Api.getWeapon(data);
        map = this.updateMap(map, response.items);
        let newItemsArray = this.mapToArray(map);
        let uniqueItems = this.filterArray(newItemsArray);
        this.addItemsAfterSearch(uniqueItems);
        console.log(localOffset, this.getFilter.offset);
        if (localOffset == this.getFilter.offset) {
          localOffset = 0;
          this.timerUpdate = setTimeout(this.update, 1000);
          break;
        }
        localOffset = localOffset + 100;
      }
    }
  }
};
</script>

<style></style>
