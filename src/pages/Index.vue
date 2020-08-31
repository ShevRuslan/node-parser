<template>
  <q-page class="flex justify-start items-start content-start q-mt-lg q-pa-md">
    <FilterItems/>
    <Table />
  </q-page>
</template>

<script>
import Table from "../components/Table";
import FilterItems from '../components/FilterItems';
export default {
  name: "PageIndex",
  components: { Table, FilterItems }
};
</script>
