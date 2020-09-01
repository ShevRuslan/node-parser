<template>
  <div class="flex q-mb-lg">
    <q-select
      outlined
      v-model="type"
      :options="options"
      label="Тип"
      class="filter-select"
      dense
    />
    <q-select
      outlined
      v-model="type_weapon"
      :options="typeWeapon"
      label="Тип оружия"
      class="q-ml-md filter-select"
      dense
    />
    <div class="flex q-ml-lg">
      <q-input outlined v-model="minPrice" label="От" dense />
      <q-input outlined v-model="maxPrice" label="До" dense class="q-ml-md" />
    </div>
    <q-btn color="primary" class="q-ml-lg filter-select" dense>
      Поиск
    </q-btn>
    <div class="flex q-ml-xl">
      <q-input
        outlined
        v-model="textSearch"
        label="Поиск по названию"
        dense
        @input="searchByName"
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
      textSearch: ""
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
    }
  },
  methods: {
    ...mapMutations([
      "changeType",
      "changeTypeWeapon",
      "changeMinPrice",
      "changeMaxPrice"
    ]),
    ...mapActions(["addItems"]),
    async searchByName(value) {
      const response = await Api.getWeaponByName(value);
      console.log(response.items);
      this.addItems(response.items);
    }
  }
};
</script>

<style lang="scss">
.filter-select {
  min-width: 200px;
}
</style>
