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
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section>
              <q-toggle
                color="blue"
                :label="scope.opt"
                v-model="type"
                :val="scope.opt"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select
        outlined
        v-model="type_weapon"
        :options="typeWeapon"
        label="Тип оружия"
        multiple
        class=" filter-select"
        dense
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section>
              <q-toggle
                color="blue"
                :label="scope.opt"
                v-model="type_weapon"
                :val="scope.opt"
              />
            </q-item-section>
          </q-item> </template
      ></q-select>
      <q-select
        v-model="valute"
        :options="value"
        label="Валюта"
        class="filter-select"
        outlined
        dense
        options-dense
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label v-html="scope.opt.label" />
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select
        outlined
        v-model="precentageFirst"
        :options="precentage"
        label="Сервис 1"
        class=" filter-select"
        dense
      />
      <q-select
        outlined
        v-model="precentageSecond"
        :options="precentage"
        label="Сервис 2"
        class=" filter-select"
        dense
      />
      <q-input
        outlined
        v-model="minPrice"
        label="От"
        dense
        class="filter-select"
      />
      <q-input
        outlined
        v-model="maxPrice"
        label="До"
        dense
        class="filter-select"
      />
      <q-btn color="primary" class=" filter-select" dense @click="search">
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
    <div class="flex notify-audio q-mt-lg">
      <q-slider
        v-model="notifyPercent"
        :min="0"
        :max="100"
        :step="1"
        label
        label-always
        color="primary"
        class="filter-select q-mr-lg slider"
        dense
      />
      <q-toggle label="Проигрывать" v-model="isAudio" />
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
      precentage: [
        "buff.163 min price",
        "buff.163 autobuy",
        "steam min price",
        "csgotm price",
        "csgotm autobuy"
      ],
      value: [
        {
          label: "USD",
          value: "USD",
          description: "Американский доллар",
          icon: "$"
        },
        {
          label: "RUB",
          value: "RUB",
          description: "Российский рубль",
          icon: "₽"
        },
        {
          label: "CNY",
          value: "CNY",
          description: "Китайский юань",
          icon: "¥"
        }
      ],
      count: null
    };
  },
  computed: {
    // смешиваем результат mapGetters с внешним объектом computed
    ...mapGetters(["getFilter", "getNotifyPercent", "getIsAudio"]),
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
    },
    precentageFirst: {
      get() {
        return this.getFilter.precentageServiceFirst;
      },
      set(value) {
        this.changePrecentageFirst(value);
      }
    },
    precentageSecond: {
      get() {
        return this.getFilter.precentageServiceSecond;
      },
      set(value) {
        this.changePrecentageSecond(value);
      }
    },
    valute: {
      get() {
        return this.getFilter.valute;
      },
      set(value) {
        this.changeValute(value);
      }
    },
    notifyPercent: {
      get() {
        return this.getNotifyPercent;
      },
      set(value) {
        this.changePercentNotify(value);
      }
    },
    isAudio: {
      get() {
        return this.getIsAudio;
      },
      set(payload) {
        this.changeIsAudio(payload);
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
      "changeOffset",
      "changeTextSearch",
      "changeUpdateFilter",
      "changePrecentageFirst",
      "changePrecentageSecond",
      "changeValute",
      "changePercentNotify",
      "changeIsAudio"
    ]),
    ...mapActions(["addItemsAfterSearch"]),
    async searchByName(value) {
      this.changeOffset(0);
      const response = await this.request();
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
        precentageItems: this.precentageItemsmtype,
        valute: this.valute.value,
        precentageServiceFirst: this.precentageFirst,
        precentageServiceSecond: this.precentageSecond
      });
      const data = {
        type: JSON.stringify(this.type),
        type_weapon: JSON.stringify(this.type_weapon),
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        offset: this.offset,
        textSearch: this.textSearch,
        precentageItems: this.precentageItems,
        valute: this.valute.value,
        serviceFirst: this.precentageFirst,
        serviceSecond: this.precentageSecond
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
    justify-content: space-between;
    height: 40px;
    .filter-select {
      width: 12%;
    }
    .input-search {
      min-width: 250px;
    }
  }
  .notify-audio {
    align-items: center;
    .slider {
      width: 400px;
    }
  }
}
</style>
