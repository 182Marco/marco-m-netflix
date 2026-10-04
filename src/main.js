import Vue from 'vue';
import App from './App';
// NECESSARIO PER FUNZIONAMENTO DI VUEX
import store from './store/store.js';
import Vuex from 'vuex';

Vue.use(Vuex);
// ****************************+***********

Vue.config.productionTip = false;

new Vue({
  // NECESSARIO PER FUNZIONAMENTO DI VUEX
  store,
  // ****************************+***********
  render: (h) => h(App),
}).$mount('#app');
