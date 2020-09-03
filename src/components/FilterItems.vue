<template>
  <div class="flex q-mb-lg filter">
    <div class="filter-item q-mb-lg">
      <q-select
        outlined
        v-model="type"
        :options="options"
        label="Тип"
        multiple 
        class="filter-select"
        dense
      />
      <q-select
        outlined
        v-model="type_weapon"
        :options="typeWeapon"
        label="Тип оружия"
        multiple
        class=" filter-select"
        dense
      />
      <q-input outlined v-model="minPrice" label="От" dense class="filter-select" />
      <q-input outlined v-model="maxPrice" label="До" dense class="filter-select" />
      <q-btn
        color="primary"
        class=" filter-select"
        dense
        @click="search"
      >
        Поиск
      </q-btn>
    </div>
    <div class="flex filter-item q-mb-lg">
      <q-input
        outlined
        v-model="textSearch"
        label="Поиск по названию"
        dense
        @input="searchByName"
        class="input-search"
      />
    </div>
  </div>
</template>

<script>
import Api from "../service/api.js";
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import { mapActions } from "vuex";
export default {
  name: "FilterItems",
  data() {
    return {
      options: ["StatTrak", "Souvenir", "Normal"],
      typeWeapon: ["Knife", "Gloves", "Weapon"],
    };
  },
  computed: {
    // смешиваем результат mapGetters с внешним объектом computed
    ...mapGetters(["getFilter"]),
    type: {
      get() {
        return this.getFilter.type;
      },
      set(value) {
        this.changeType(value);
      }
    },
    type_weapon: {
      get() {
        return this.getFilter.type_weapon;
      },
      set(value) {
        this.changeTypeWeapon(value);
      }
    },
    minPrice: {
      get() {
        return this.getFilter.minPrice;
      },
      set(value) {
        this.changeMinPrice(value);
      }
    },
    maxPrice: {
      get() {
        return this.getFilter.maxPrice;
      },
      set(value) {
        this.changeMaxPrice(value);
      }
    },
    offset: {
      get() {
        return this.getFilter.offset;
      },
      set(value) {
        this.changeOffset(value);
      }
    },
    textSearch: {
      get() {
        return this.getFilter.textSearch;
      },
      set(value) {
        this.changeTextSearch(value);
      }
    }
  },
  methods: {
    ...mapMutations([
      "changeType",
      "changeTypeWeapon",
      "changeMinPrice",
      "changeMaxPrice",
      "changeLoading",
      'changeOffset',
      'changeTextSearch',
      'changeUpdateFilter'
    ]),
    ...mapActions(["addItemsAfterSearch"]),
    async searchByName(value) {
      this.changeOffset(0);
      const response = await this.request();
      console.log(response.items);
      this.addItemsAfterSearch(response.items);
    },
    async search() {
      this.changeOffset(0);
      this.changeLoading(true);
      const response = await this.request();
      this.addItemsAfterSearch(response.items);
      this.changeLoading(false);
    },
    async request() {
      this.changeUpdateFilter({
        type: this.type,
        type_weapon: this.type_weapon,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        offset: this.offset,
        textSearch: this.textSearch,
      })
       const data = {
        type: JSON.stringify(this.type),
        type_weapon: JSON.stringify(this.type_weapon),
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        offset: this.offset,
        textSearch: this.textSearch,
      };
      const response = await Api.getWeapon(data);
      return response;
    }
  }
};
</script>

<style lang="scss">
.filter {
  width: 100%;
  justify-content: space-between;
  flex-direction: column;
  .filter-item {
    display: flex;
    &:first-child {
      width: 70%;
    }
    &:nth-child(2) {
      width: 30%;
    }
    justify-content: space-between;
    .filter-select {
      width: 19%;
    }
    .input-search {
      min-width: 250px;
    }
  }

}
</style>
