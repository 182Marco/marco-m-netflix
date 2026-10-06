import { createApp } from 'vue';
import App from './App';
// NECESSARIO PER FUNZIONAMENTO DI VUEX
import store from './store/store.js';

const app = createApp(App);

// NECESSARIO PER FUNZIONAMENTO DI VUEX
app.use(store);
// ****************************+***********

app.mount('#app');
