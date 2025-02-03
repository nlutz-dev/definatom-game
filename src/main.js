import { createApp } from 'vue';

import BaseCard from './components/UI/BaseCard.vue';
import BaseButton from './components/UI/BaseButton.vue';
import WordComponent from './components/survey/WordComponent.vue' 
import Definition from './components/survey/Definition.vue' 
import Definatom from './components/survey/Definatom.vue' 
import App from './App.vue';

const app = createApp(App);

app.component('base-card', BaseCard);
app.component('base-button', BaseButton);
app.component('word-component', WordComponent);
app.component('definition', Definition);
app.component('definatom', Definatom);

app.mount('#app');
