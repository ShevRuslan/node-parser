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
        type: 'Normal',
        type_weapon: 'Weapon',
        minPrice: '',
        maxPrice: "",
      },
      items: [],
    },
    getters: {
      getItems({items}) {
        return items;
      },
      getFilter({filter}) {
        return filter
      }
    },
    //sync
    mutations: {
      addItems(state, payload) {
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
      }
    },
    //async
    actions: {
      addItems({ commit }, items) {
        commit('addItems', items);
      },
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  });

  return Store;
}