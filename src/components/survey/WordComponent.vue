<template>
  <div class="word">
    <div
    class="wordTitle"
    @click="pickStart"
    >
      {{ w.w }} 
    </div>
    <div v-if="gS == 'on'">
      <definition 
      v-for="definition in w.definitions" 
      :key="definition.id" 
      :definition="definition"
      :gS="gS"
      @definatom-clicked="definatomClicked"
      >
    </definition>
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
      w: this.word,
      gS: this.gameState
    }
  },
  emits: [],

  methods: {
    definatomClicked(definatom){
      this.$emit('definatom-clicked', definatom, this.w.winner)
    },
    pickStart(){
      this.$emit('starter-clicked', this.w)
    }
  },
  mounted() {
  }
};
</script>

<style scoped>

/* .word{
   position: fixed;
   top: 100px;
   margin: auto;
} */
.wordTitle {
  padding: .5rem;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

</style>