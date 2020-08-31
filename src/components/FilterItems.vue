<template>
  <div class="flex q-mb-lg">
    <q-select
      outlined
      v-model="model"
      :options="options"
      label="Тип"
      class="filter-select"
      dense
    />
    <q-select
      outlined
      v-model="modelType"
      :options="typeWeapon"
      label="Тип оружия"
      class="q-ml-md filter-select"
      dense
    />
    <div class="flex q-ml-lg">
      <q-input outlined v-model="text" label="От" dense />
      <q-input outlined v-model="text" label="До" dense class="q-ml-md" />
    </div>
     <q-btn color="primary" class="q-ml-lg filter-select" dense>
      Поиск
    </q-btn>
    <div class="flex q-ml-xl">
      <q-input outlined v-model="text" label="Поиск по названию" dense />
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterItems",
  data() {
    return {
      model: "Normal",
      options: ["StatTrak", "Souvenir", "Normal"],
      modelType: "Weapon",
      typeWeapon: ["Knife", "Gloves", "Weapon"],
      text: '',
    };
  }
};
</script>

<style lang="scss">
.filter-select {
  min-width: 200px;
}
</style>
