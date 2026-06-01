<template>
  <div class="word">
    <div class="wordTitle" @click="pickStart">
      {{ word.w }}
    </div>
    <div v-if="gameState == 'on'">
      <ul class="definitions-list">
        <definition v-for="definitionItem in displayedDefinitions" :key="definitionItem.id" :definition="definitionItem"
          :gS="gameState" @definatom-clicked="definatomClicked">
        </definition>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'word',
    'gameState'
  ],
  data() {
    return {
      displayedDefinitions: [],
      timeoutHandles: []
    }
  },
  emits: ['definatom-clicked', 'starter-clicked'],

  mounted() {
    if (this.gameState === 'on') {
      this.populateDefinitionsGradually();
    }
  },
  beforeUnmount() {
    this.timeoutHandles.forEach(clearTimeout);
  },

  watch: {
    gameState(newValue) {
      if (newValue === 'on') {
        this.populateDefinitionsGradually();
      }
    }
  },

  methods: {
    definatomClicked(definatom) {
      this.$emit('definatom-clicked', definatom, this.word.winner)
    },
    pickStart() {
      this.$emit('starter-clicked', this.word)
    },
    populateDefinitionsGradually() {
      this.displayedDefinitions = [];
      this.timeoutHandles.forEach(clearTimeout);
      this.timeoutHandles = [];

      if (!this.word || !this.word.definitions || this.word.definitions.length === 0) {
        return;
      }

      this.word.definitions.forEach((def, index) => {
        const delay = 400 * index;
        const handle = setTimeout(() => {
          this.displayedDefinitions.push(def);
        }, delay);
        this.timeoutHandles.push(handle);
      });
    }
  }
};
</script>

<style scoped>
.wordTitle {
  padding: .5rem;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

.word {
  /* border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26); */
}

.definitions-list {
  padding: 0;
  margin: 0;
}
</style>