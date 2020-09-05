import Vue from 'vue';
import Vuex from 'vuex';

// import example from './module-example'

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      filter: {
        type: ['Normal'],
        type_weapon: ['Weapon'],
        minPrice: 0,
        maxPrice: 10000,
        offset: 0,
        precentageItems: 'Процент 2',
        textSearch:'',
      },
      updateFilter: {},
      items: [],
      loading:true
    },
    getters: {
      getItems({items}) {
        return items;
      },
      getFilter({filter}) {
        return filter
      },
      getUpdateFilter({ updateFilter }) {
        return updateFilter;
      },
      getLoading({loading}) {
        return loading
      }
    },
    //sync
    mutations: {
      addItems(state, payload) {
        if (state.items.length == 0) state.items = payload;
        else state.items = [...state.items, ...payload];
      },
      addItemsAfterSearch(state, payload) {
        state.items = payload;
      },
      changeType (state, payload) {
        state.filter.type = payload;
      },
      changeTypeWeapon (state, payload) {
        state.filter.type_weapon = payload;
      },
      changeMinPrice (state, payload) {
        state.filter.minPrice = payload;
      },
      changeMaxPrice (state, payload) {
        state.filter.maxPrice = payload;
      },
      changeLoading(state, payload) {
        state.loading = payload;
      },
      changeOffset(state, payload) {
        state.filter.offset = payload;
      },
      changeTextSearch(state, payload) {
        state.filter.textSearch = payload;
      },
      changeUpdateFilter(state, payload) {
        state.updateFilter = payload;
      },
      changePrecentage(state, payload) {
        state.filter.precentageItems = payload;
      }
    },
    //async
    actions: {
      addItems({ commit }, items) {
        commit('addItems', items);
      },
      addItemsAfterSearch({commit}, items) {
        commit('addItemsAfterSearch', items);
      }
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  });

  return Store;
}