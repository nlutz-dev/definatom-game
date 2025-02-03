<template>
  <span :class="`${da.length > 3 ? 'clickable' : 'notClickable'}`" @click="definatomClicked()">
    {{ da }}
  </span>
</template>

<script>
export default {
  props: [
    'definatom'
  ],
  data() {
    return {
      da: this.definatom
    }
  },
  emits: [],

  methods: {
    definatomClicked() {
      if (this.da.length < 4 || this.containsPunctuation(this.da)) {
        return
      }
      this.$emit('definatom-clicked', this.da)
    },
    containsPunctuation(word) {
      return /[.,:;!?]/g.test(word);
    }
  },
  mounted() {
  }
};
</script>

<style scoped>
span {
  margin-right: 3px;
  white-space: nowrap;
}

.clickable:hover {
  text-decoration: underline;
}
</style>