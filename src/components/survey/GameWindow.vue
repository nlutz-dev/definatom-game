<template>
  <section>
    <div class="title">
      <h2>Definatom</h2>
      <h2 class="subTitle">1. a word occuring in the definition of another word.</h2>
      <h2 class="subTitle">2. the smallest indivisble component of a definition.</h2>
      <h2 class="subTitle">3. a word I made up, and the name of this game.</h2>
      <h2 class="subTitle" style="text-decoration: underline" @click="forEmployers = !forEmployers">For Employers!</h2>
      <h2 class="subTitle" v-if="forEmployers==true">Hello! This little app is made with Vue, making Api calls to WordsApi and hosted with Google Firebase.</h2>
      <h2 class="subTitle" v-if="forEmployers==true">I plan to improve the win screen and make it all more stylish, so call this an MVP.</h2>
      <!-- <h2>The Game is: {{ this.gameState }}</h2>  -->
      <div class="subTitle" v-if="gameState == 'win'">You Win! Your winning word was "{{ this.winningWord }}" Total links: {{
        this.totalLinks }} </div>
    </div>
    
    <div class="screen">
      <div class="wordsBox" v-if="gameState == 'on' || gameState == 'win'">
        <word-component :gameState="this.gameState" :word="winner1" v-if="showWord1 && winner1.definitions.length > 0"
          @definatom-clicked="fetchDefinition">
        </word-component>
        <word-component :gameState="this.gameState" :word="winner2" v-if="showWord2 && winner2.definitions.length > 0"
          @definatom-clicked="fetchDefinition">
        </word-component>
      </div>
      <div class="wordChain" v-if="gameState == 'on' || gameState == 'win'">
        <div class="button">
          <base-button @click="reset()">Reset!</base-button>
        </div>
        Word Chain:
        <div class="chainLink" v-for="word in this.wordChain" :key="word.id">{{ word }}</div>
      </div>
      <div class="instructionsBox" v-if="gameState == 'off'">
        <div >
          When you begin the game, two random words will be grabbed from an online dictionary.<br><br>
          Your goal is to connect these two words by clicking on words in their definitions. <br><br>
          Each time you click on word in a definition, that word will become one of your two active words. <br><br>
          To add just a little challenge, you cannot click on any words that are three letters or shorter!<br><br>
          You win if you can click on one of your active words in the definitions of the other active word.
        </div>
        <div class="button">
          <base-button @click="startGame()">Start Game!</base-button>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      gameState: "off",
      winningWord: "",
      wordChain: [],
      totalLinks: 0,
      showWord1: true,
      showWord2: true,
      frontEnd: 0,
      backEnd: 1,
      forEmployers: false,
      shortenedDefinatom:'',
      showDefinition1: false,
      showDefinition2: false,
      starter: '',
      isRetry: false,
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
      console.log(this.wordChain)
    },
    reset() {
      Object.assign(this.$data, this.$options.data.apply(this))
     this.startGame()
    },
    fetchTest() {
      fetch("https://wordsapiv1.p.rapidapi.com/words/example",
        {
          method: 'GET',
          headers: { 'X-RapidAPI-Key': '8737d2e132msh5804d3822dee36bp128b98jsn58eeaa68741d', 'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com' }
        }
      ).then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
    },
    fetchDefinition(definatom, clickedNumber) {
      if (this.gameState == 'win'){
        return
      }
      if (clickedNumber == 1 && definatom == this.winner2.w) {
        this.winningWord = definatom
        this.gameState = "win"
        return
      }
      if (clickedNumber == 2 && definatom == this.winner1.w) {
        this.winningWord = definatom
        this.gameState = "win"
        return
      }
      if (clickedNumber == 1) {
        this.showWord1 = false
      }
      if (clickedNumber == 2) {
        this.showWord2 = false
      }
      definatom = definatom.replace(/\W/g, '')
      console.log(definatom)
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
            if (this.isRetry == true) {
              alert('Sorry, the word you clicked might not have a definition! Please try a different word.')
              this.showDefinitions = true
              this.showWord1 = true
              this.showWord2 = true
              this.isRetry = false
              return
            }
            else
            this.shortenedDefinatom = definatom.slice(0, -1);
            this.isRetry = true
            console.log(definatom)
            this.fetchDefinition(this.shortenedDefinatom, clickedNumber)
          }
          if (word != undefined && word.definitions.length > 0){
            let newWord = { w: definatom, definitions: [] }
          word.definitions.forEach((definition, index) => newWord.definitions[index] = definition.definition)
          if (clickedNumber == 1) {
            this.winner1.w = newWord.w
            if (newWord.definitions.length > 3) newWord.definitions.length = 3
            this.winner1.definitions = newWord.definitions
            this.showWord1 = true
            this.wordChain.splice(this.frontEnd + 1, 0, this.winner1.w)
            this.frontEnd++
            this.backEnd++
          }
          if (clickedNumber == 2) {
            this.winner2.w = newWord.w
            if (newWord.definitions.length > 3) newWord.definitions.length = 3
            this.winner2.definitions = newWord.definitions
            this.showWord2 = true
            this.wordChain.splice(this.backEnd, 0, this.winner2.w)
          }
          this.showDefinitions = true
          this.totalLinks++
          }
          

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
          this.wordChain.splice(this.frontEnd, 0, this.winner1.w)
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
          this.wordChain.splice(this.backEnd, 0, this.winner2.w)
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
.screen {
  height: 100%;
  max-width: 800px;
  background: linear-gradient(#daa0e994, #b5a3d58d);
  position: absolute;
  padding-top: 3rem;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  display: flex;
}

.flexDisplay {
  display: flex;
}

.instructionsBox{
  margin-left: auto;
  margin-right: auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 0;
  padding: 3rem;
  padding-bottom: .5rem;
}

.title {
  max-width: 800px;
  background: #daa0e994;
  font-family: "Lucida Console", "Courier New", monospace;
  margin-left: auto;
  margin-right: auto;
  font-size: 2.5rem;
  padding-bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

.subTitle {
  max-width: 800px;
  font-size: 1rem;
  padding-top: 0;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
}

.button {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wordsBox {
  text-align: center;
  width: 580px;
  max-width: 580px;
  /* max-height: 500px; */
}

.wordChain {
  text-align: center;
  width: 220px;
  max-width: 220px;
  /* max-height: 500px; */
}

.chainLink {
  padding: .5rem;
  margin-top: 1rem;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  opacity: 1;
  /* animation: fadeIn 2s forwards; */
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.word {
  display: inline-table;
  width: 500px;
  max-width: 500px;
  /* height: 200px; */
  top: 100px;
}

@media (max-width: 450px) {
  .screen {
    max-width: 100%;
    max-height: 100%;
    flex-direction: column;
    background: linear-gradient(#daa0e994, #b5a3d58d);
    display: flex;
  }

  .wordsBox {
    text-align: center;
    width: 75%;

  }

  .word {
    display: inline-table;
    width: 75%;
    margin: auto;
    margin-top: 3%;
  }
}
</style>