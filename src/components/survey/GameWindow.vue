<template>
  <section>
    <div class="title">
      <h2>Welcome to the Dictionary Game!</h2>
      {{ this.gameState }}
    </div>
    <base-card>
      <div v-if="gameState == 'win'">You Win!</div>
      <div class="wordsBox" v-if="gameState == 'picking'">
        <word-component v-if="showWord1 && winner1.definitions.length > 0" :word="winner1" :gameState="this.gameState"
          @starter-clicked="starterClicked">
        </word-component>
        <word-component v-if="showWord2 && winner2.definitions.length > 0" :word="winner2" :gameState="this.gameState"
          @starter-clicked="starterClicked">
        </word-component>
      </div>
      <div class="wordsBox" v-if="gameState == 'on'">
        <word-component :gameState="this.gameState" :word="winner1" v-if="showWord1 && winner1.definitions.length > 0"
          @definatom-clicked="fetchDefinition">
        </word-component>
        <word-component :gameState="this.gameState" :word="winner2" v-if="showWord2 && winner2.definitions.length > 0"
          @definatom-clicked="fetchDefinition">
        </word-component>
      </div>
      <div v-if="gameState == 'off'">
        <base-button @click="startGame()">Start Game!</base-button>
      </div>
    </base-card>
  </section>
</template>

<script>
export default {
  data() {
    return {
      gameState: "off",
      showWord1: true,
      showWord2: true,
      showDefinition1: false,
      showDefinition2: false,
      starter: '',
      winner1: {
        winner: 0,
        w: '',
        definitions: []
      },
      winner2: {
        winner: 0,
        w: '',
        definitions: []
      }
    }
  },
  emits: [],
  methods: {
    startGame() {
      this.gameState = "fetching!"
      // this.fetchTest();
      this.fetchRandom1();
      setTimeout(() => {
        this.fetchRandom2();
      }, 200)
      this.showDefinitions = false
    },
    fetchTest() {
      fetch("https://wordsapiv1.p.rapidapi.com/words/example",
      {
          method: 'GET',
          headers: { 'X-RapidAPI-Key': '8737d2e132msh5804d3822dee36bp128b98jsn58eeaa68741d', 'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'}
        }
      ).then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
    },
    fetchDefinition(definatom, clickedNumber) {
      if (clickedNumber == 1 && definatom == this.winner2.w) {
        this.gameState = "win"
      }
      if (clickedNumber == 2 && definatom == this.winner1.w) {
        this.gameState = "win"
      }
      if (clickedNumber == 1) {
        this.showWord1 = false
      }
      if (clickedNumber == 2) {
        this.showWord2 = false
      }
      fetch(`https://wordsapiv1.p.rapidapi.com/words/${definatom}/definitions`,
        {
          method: 'GET',
          headers: { 'X-RapidAPI-Key': '8737d2e132msh5804d3822dee36bp128b98jsn58eeaa68741d', 'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com' }
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((word) => {
          if (word == undefined || word.definitions.length == 0) {
            alert('that might not have a def')
            this.showDefinitions = true
            this.showWord1 = true
            this.showWord2 = true
            return
          }
          let newWord = { w: definatom, definitions: [] }
          word.definitions.forEach((definition, index) => newWord.definitions[index] = definition.definition)
          if (clickedNumber == 1) {
            this.winner1.w = newWord.w
            if (newWord.definitions.length > 3) newWord.definitions.length = 3
            this.winner1.definitions = newWord.definitions
            this.showWord1 = true
          }
          if (clickedNumber == 2) {
            this.winner2.w = newWord.w
            if (newWord.definitions.length > 3) newWord.definitions.length = 3
            this.winner2.definitions = newWord.definitions
            this.showWord2 = true
          }
          this.showDefinitions = true

        })
    },
    fetchRandom1() {
      fetch('https://wordsapiv1.p.rapidapi.com/words/?letterPattern=^[a-zA-Z]*$&random=true',
        {
          method: 'GET',
          headers: { 'X-RapidAPI-Key': '8737d2e132msh5804d3822dee36bp128b98jsn58eeaa68741d', 'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com' }
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((word) => {
          if (word.results == undefined) {
            console.log('retry 1')
            this.fetchRandom1()
            return
          }
          this.winner1 = { winner: 1, w: word.word, definitions: [] }
          word.results.forEach((definition, index) => this.winner1.definitions[index] = definition.definition)
          if (this.winner1.definitions.length > 3) this.winner1.definitions.length = 3
          console.log(this.winner1)
        })
    },
    fetchRandom2() {
      fetch('https://wordsapiv1.p.rapidapi.com/words/?letterPattern=^[a-zA-Z]*$&random=true',
        {
          method: 'GET',
          headers: { 'X-RapidAPI-Key': '8737d2e132msh5804d3822dee36bp128b98jsn58eeaa68741d', 'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com' }
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((word) => {
          if (word.results == undefined) {
            console.log('retry 2')
            this.fetchRandom2()
            return
          }
          this.winner2 = { winner: 2, w: word.word, definitions: [] }
          word.results.forEach((definition, index) => this.winner2.definitions[index] = definition.definition)
          this.winner2.definitions.length = 1
          console.log(this.winner2)

        })
        this.showDefinition1 = true
      this.showDefinition2 = true
      this.gameState = "on"
    },
    // starterClicked(startingWord) {
    //   console.log(startingWord.w)
    //   this.showDefinition1 = true
    //   this.showDefinition2 = true
    //   this.gameState = "on"
    // }
  },
  mounted() {

  }
};
</script>

<style scoped>
.title {
  text-align: center;
}

.wordsBox {
  text-align: center;
  max-height: 500px;
}

.word {
  display: inline-table;
  width: 600px;
  height: 500px;
  margin: auto;
  top: 100px;
}
</style>