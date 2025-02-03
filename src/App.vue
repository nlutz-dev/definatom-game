<template>
  <game-window></game-window>
</template>

<script>
import GameWindow from './components/survey/GameWindow.vue';

export default {
  components: {
    GameWindow
  },
  data() {
    return {
    };
  },
  methods: {
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

html {
  font-family: sans-serif;
}

body {
  margin: 0;
}
</style>