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
      :loading="loading"
    >
      <template v-slot:body-cell-link="props">
        <q-td :props="props">
           <a :href="props.row.link" target="_blank">{{ props.row.name }}</a>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex'
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
      }
    };
  },
  computed: {
    // смешиваем результат mapGetters с внешним объектом computed
    ...mapGetters(['getItems'])
  },
  async created() {
    const response = await Api.getWeapon();
    this.data = response.items;
    this.loading = false;
    console.log(response.items);
    this.addItems(response.items);
  },
  methods: {
     ...mapActions([
      'addItems' // проксирует `this.increment()` в `this.$store.dispatch('increment')`
    ]),
  }
};
</script>

<style></style>
