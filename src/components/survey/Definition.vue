<template>
  <transition name="fade" appear>
    <li class="definition">
      <definatom 
        v-for="definatom in definatoms" 
        :key="definatom.id" 
        :definatom="definatom"
        @definatom-clicked="definatomClicked">
      </definatom>
    </li>
  </transition>
</template>

<script>
export default {
  props: [
    'definition',
    'gS'
  ],
  data() {
    return {
      definatoms: []
    }
  },

  methods: {
    definatomClicked(definatom){
      this.$emit('definatom-clicked', definatom)
    },
    parseDefinition() {
      // Add a safety check to ensure definition is populated before splitting
      if (this.definition && typeof this.definition === 'string') {
        this.definatoms = this.definition.split(/[.,:;!? ]/);
      } else if (this.definition && this.definition.text) { 
        // Adjust this if definition is an object (e.g., this.definition.text)
        this.definatoms = this.definition.text.split(/[.,:;!? ]/);
      }
    }
  },
  mounted() {
    this.parseDefinition();
  },
  watch: {
    // Watch in case the definition data updates late
    definition: {
      handler() {
        this.parseDefinition();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.definition {
  list-style: none;
  margin: 1rem auto;
  align-items: stretch;
  max-width: 425px;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

/* Changed .list- to .fade- to match the transition name="fade" */
.fade-enter-active {
  transition: opacity .5s ease, transform .5s ease;
}

/* Changed .list- to .fade- to match the transition name="fade" */
.fade-enter-from {
  opacity: 0;
  transform: translateX(-25px); /* Changed back to 25px, but -250px works if you want a massive slide! */
}
</style>