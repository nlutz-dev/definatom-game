<template>
  <div class="definition">
      <definatom 
        v-for="definatom in definatoms" 
        :key="definatom.id" 
        :definatom="definatom"
        @definatom-clicked="definatomClicked">
      </definatom>
  </div>
</template>

<script>
export default {
  props: [
    'definition',
    'gS'
  ],
  data() {
    return {
      d: this.definition,
      gameState: this.gS,
      definatoms: []
    }
  },
  emits: [],

  methods: {
    definatomClicked(definatom){
      this.$emit('definatom-clicked', definatom)
    }
  },
  mounted() {
    this.definatoms = this.d.split(/[.,:;!? ]/)

  }
};
</script>

<style scoped>
.definition {
  margin: 1rem auto;
  align-items: stretch;
  max-width: 425px;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}
</style>