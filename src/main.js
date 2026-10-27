import { createApp } from 'vue';
import App from './App';
// NECESSARIO PER FUNZIONAMENTO DI VUEX
import store from './store/store.js';

const app = createApp(App);

// $t('categoria.chiave'): testo nella lingua scelta (reattivo al cambio lingua)
app.config.globalProperties.$t = (path) => store.getters.t(path);

// NECESSARIO PER FUNZIONAMENTO DI VUEX
app.use(store);
// ****************************+***********

app.mount('#app');
