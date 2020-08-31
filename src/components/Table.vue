<template>
  <div class="fit">
    <q-table
      dense
      title="Оружия"
      :data="data"
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
  async created() {
    const response = await Api.getWeapon();
    this.data = response.items;
    this.loading = false;
    console.log(response.items);
  }
};
</script>

<style></style>
