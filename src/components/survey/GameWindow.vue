<template>
  <section>
    <div class="title">
      <h2>Definatom</h2>
      <modal @start-game="startGame" v-if="gameState == 'off'" :gameState="this.gameState">
      </modal>
      <!-- <div class="button" v-if="gameState == 'on'">
        <base-button @click="reset()">Reset!</base-button>
      </div> -->
      <!-- Welcome {{ displayName }}
       <base-button v-if="loggedIn == false" class=button @click="signInWithGoogle()">Sign in with Google</base-button>
      <base-button v-if="loggedIn == true" class=button @click="logOutUser()">Log Out?</base-button> -->
      <!-- <h2 class="subTitle">1. a word occuring in the definition of another word.</h2>
      <h2 class="subTitle">2. the smallest indivisble component of a definition.</h2>
      <h2 class="subTitle">3. a word I made up, and the name of this game.</h2> -->
      <!-- <h2 class="subTitle" style="text-decoration: underline" @click="forEmployers = !forEmployers">For Employers!</h2>
      <h2 class="subTitle" v-if="forEmployers == true">Hello! This little app is made with Vue, making Api calls to
        WordsApi and hosted with Google Firebase.</h2>
      <h2 class="subTitle" v-if="forEmployers == true">I plan to improve the win screen and make it all more stylish, so
        call this an MVP.</h2> -->
      <!-- <h2>The Game is: {{ this.gameState }}</h2>  -->
      <div class="youWin" v-if="gameState == 'win'">You Win! <br>Your winning word was "{{ this.winningWord }}" Total
        links: {{ this.totalLinks }} Average Frequency Score: {{ this.avgFreqScore }} (100 = Least Frequent, 900 = Most
        Frequent)
      </div>
      <!-- <div class="subTitle" v-if="newBestScore == true">You just set the best score for today!
      </div>
      <div class="subTitle" v-if="firstWin == true">You just set the best score for today!
      </div> -->
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
        Word Chain:
        <div class="chainLink" v-for="word in this.wordChain" :key="word.id">{{ word }}</div>
      </div>
      <!-- <div class="instructionsBox" v-if="gameState == 'off'">
        <div>
          When you begin the game, two random words will be grabbed from an online dictionary.<br><br>
          Your goal is to connect these two words by clicking on words in their definitions. <br><br>
          Each time you click on word in a definition, that word will become one of your two active words. <br><br>
          To add just a little challenge, you cannot click on any words that are three letters or shorter!<br><br>
          You win if you can click on one of your active words in the definitions of the other active word.
        </div>
      </div> -->
    </div>
  </section>
</template>

<script lang="js">
import { db } from '../../firebaseInit.js'
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseInit.js';
import { collection, getDocs } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../../firebaseInit.js';

const functions = getFunctions(app);

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
      shortenedDefinatom: '',
      showDefinitions: false,
      showDefinition1: false,
      showDefinition2: false,
      isRetry: false,
      newBestScore: false,
      firstWin: false,
      frequencyArray: [],
      avgFreqScore: 0,
      sumOfFrequencies: 0,
      displayName: '',
      userId: '',
      loggedIn: false,
      startingWord1: '',
      startingWord2: '',
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
  methods:
  {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        // The signed-in user info.
        const user = result.user;

        console.log("User signed in:", user.displayName, user.uid);
        this.displayName = user.displayName
        this.userId = user.uid
        this.loggedIn = true
        // Now you have the user's UID (user.uid)!
        // You can use user.uid to store their high score in Firestore.
        setDoc(doc(db, "highScores", user.uid), { displayName: user.displayName, totalLinks: 0, avgFreqScore: 0 });

        // You can also access the Google Access Token if needed:
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;

      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData?.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(email, credential)
        console.error("Error signing in with Google:", errorMessage, errorCode);
      }
    },
    async logOutUser() {
      try {
        await signOut(auth);
        this.displayName = ''
        this.loggedIn = false
        // onAuthStateChanged will update currentUser.value to null automatically
      } catch (error) {
        console.error("Error signing out:", error);
        // Handle error UI if needed
      }
    },
    async fetchDefinition(definatom, clickedNumber) {
      if (this.gameState === 'win') {
        return;
      }

      if ((clickedNumber === 1 && definatom === this.winner2.w) ||
        (clickedNumber === 2 && definatom === this.winner1.w)) {
        this.winningWord = definatom;
        this.gameState = "win";
        await this.callUpdateUserScoreCloudFunction(this.totalLinks, this.avgFreqScore, this.displayName);
        return;
      }

      if (clickedNumber === 1) {
        this.showWord1 = false;
      }
      if (clickedNumber === 2) {
        this.showWord2 = false;
      }

      let cleanDefinatom = definatom.replace(/\W/g, '');

      try {
        const fetchWordDefinitionCallable = httpsCallable(functions, 'fetchWordDefinitionFromAPI');
        const result = await fetchWordDefinitionCallable({ definatom: cleanDefinatom });
        const wordDataFromCloudFunction = result.data;

        console.log("Word data received from Cloud Function:", wordDataFromCloudFunction);

        if (!wordDataFromCloudFunction || wordDataFromCloudFunction.definitions.length === 0) {
          if (this.isRetry === true) {
            alert('Sorry, the word you clicked might not have a definition! Please try a different word.');
            this.showDefinitions = true;
            this.showWord1 = true;
            this.showWord2 = true;
            this.isRetry = false;
            return;
          } else {
            this.shortenedDefinatom = cleanDefinatom.slice(0, -1);
            this.isRetry = true;
            console.log(`Retrying with shortened word: ${this.shortenedDefinatom}`);
            this.fetchDefinition(this.shortenedDefinatom, clickedNumber);
            return;
          }
        }

        let newWord = { w: wordDataFromCloudFunction.word, definitions: wordDataFromCloudFunction.definitions };

        if (clickedNumber === 1) {
          this.winner1.w = newWord.w;
          this.winner1.definitions = newWord.definitions;
          this.showWord1 = true;
          this.wordChain.splice(this.frontEnd + 1, 0, this.winner1.w);
          this.frontEnd++;
          this.backEnd++;
        }
        if (clickedNumber === 2) {
          this.winner2.w = newWord.w;
          this.winner2.definitions = newWord.definitions;
          this.showWord2 = true;
          this.wordChain.splice(this.backEnd, 0, this.winner2.w);
        }

        if (wordDataFromCloudFunction.frequency !== null) {
          this.frequencyArray.push(wordDataFromCloudFunction.frequency);
          console.log(this.frequencyArray);
          this.sumOfFrequencies = 0;
          for (let i = 0; i < this.frequencyArray.length; i++) {
            this.sumOfFrequencies += this.frequencyArray[i];
          }
        }

        this.totalLinks++;
        if (this.totalLinks !== 0) {
          this.avgFreqScore = this.sumOfFrequencies / this.totalLinks;
          this.avgFreqScore = Math.floor(this.avgFreqScore * 100)
        } else {
          console.warn("Warning: totalLinks is zero! Cannot divide by zero.");
        }

        console.log("The sum of frequencies is:", this.sumOfFrequencies);
        console.log("The final result after division is:", this.avgFreqScore);
        this.showDefinitions = true;

      } catch (error) {
        console.error("Error fetching definition via Cloud Function: ", error);
        alert(`Failed to get definition: ${error.message || 'An unknown error occurred.'}`);
        this.showDefinitions = true;
        this.showWord1 = true;
        this.showWord2 = true;
        this.isRetry = false;
      }
    },
    async getAllDocumentsFromCollection() {
      try {
        const myCollectionRef = collection(db, "wordsDujoir");
        const querySnapshot = await getDocs(myCollectionRef);

        querySnapshot.forEach((doc) => {
          const docId = doc.id;
          const docData = doc.data();

          if (docId === 'word1' || docId === 'word2') {
            const definitionsArray = [];
            if (docData.definition1 && docData.definition1 !== "No definition found") {
              definitionsArray.push(docData.definition1);
            }
            if (docData.definition2 && docData.definition2 !== "No definition found") {
              definitionsArray.push(docData.definition2);
            }
            if (docData.definition3 && docData.definition3 !== "No definition found") {
              definitionsArray.push(docData.definition3);
            }

            const wordObject = {
              w: docData.word,
              definitions: definitionsArray
            };


            if (docId === 'word1') {
              this.winner1 = { ...wordObject, winner: 1 };
              this.startingWord1 = { ...wordObject };
              this.wordChain.splice(this.frontEnd, 0, this.winner1.w)
              console.log("winner1 updated:", this.winner1);
            } else if (docId === 'word2') {
              this.winner2 = { ...wordObject, winner: 2 };
              this.startingWord2 = { ...wordObject }
              this.wordChain.splice(this.backEnd, 0, this.winner2.w)
              console.log("winner2 updated:", this.winner2);
            }
          }
        });

      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    },
    startGame() {
      this.gameState = "fetching!"
      //below unlocks infinite mode
      // this.fetchRandom1();
      // setTimeout(() => {
      //   this.fetchRandom2();
      // }, 200)
      this.showDefinitions = false
      this.showDefinition1 = true
      this.showDefinition2 = true
      this.gameState = "on"
      console.log(this.wordChain)
    },
    reset() {
      //not functional now
      console.log(this.winner1, this.winner2)
      this.winner1 = this.startingWord1;
      this.winner2 = this.startingWord2;
    },
    async updateScoreInDb() {
      try {
        const scoreDocRef = doc(db, 'score', 'score');

        const docSnap = await getDoc(scoreDocRef);

        let currentBestScore = Infinity;

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && typeof data.totalLinks === 'number') {
            currentBestScore = data.totalLinks;
          }
        }

        if (currentBestScore == 0) {
          await setDoc(doc(db, "highScores", this.userId), { displayName: this.displayName, totalLinks: this.totalLinks, avgFreqScore: this.avgFreqScore });
          this.firstWin = true
          console.log("You're the first to clear the game today! Total Links:", this.totalLinks);
          return
        }
        if (this.totalLinks < currentBestScore) {
          await setDoc(doc(db, "highScores", this.userId), { displayName: this.displayName, totalLinks: this.totalLinks, avgFreqScore: this.avgFreqScore });
          this.newBestScore = true
          console.log("New best score recorded:", this.totalLinks);
        }

      } catch (error) {
        console.error("Error managing score update: ", error);
      }
    },
    async callUpdateUserScoreCloudFunction(totalLinks, avgFreqScore, displayName) {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated. Please sign in to update your score.");
        return; // Or throw an error to the calling UI
      }

      // Get a reference to your callable function
      const callableUpdateUserScore = httpsCallable(functions, 'updateUserScore');
      try {
        // Call the Cloud Function with the necessary data
        // The `this.displayName`, `this.totalLinks`, `this.avgFreqScore`
        // would come from your component's state or props.
        const result = await callableUpdateUserScore({
          displayName: displayName,
          totalLinks: totalLinks,
          avgFreqScore: avgFreqScore
        });

        // Access the data returned from the Cloud Function
        const { success, firstWin, newDailyBest, personalBestUpdated, message } = result.data;

        if (success) {
          console.log("Score update successful:", message);
          // Now you can update your client-side UI based on these flags
          // e.g., this.firstWin = firstWin; this.newBestScore = newDailyBest;
          // You might also want to show a toast message with the 'message' text.
          return { firstWin, newDailyBest, personalBestUpdated }; // Pass flags back to client UI
        } else {
          console.error("Cloud Function indicated an error:", message);
          // Handle non-success scenario (though the function should throw HttpsError for errors)
          throw new Error(message);
        }
      } catch (error) {
        console.error("Error calling updateUserScore Cloud Function:", error);
        // Handle specific HttpsError types if needed for user feedback
        if (error.code) {
          console.error(`Firebase Functions Error: Code: ${error.code}, Message: ${error.message}`);
          // Example: if (error.code === 'unauthenticated') { showSignInPrompt(); }
        }
        throw error; // Re-throw to be handled by the calling UI component
      }
    }
  },
  mounted() {
    //below unlocks daily mode
    this.getAllDocumentsFromCollection()
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

.instructionsBox {
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

@keyframes rainbow {

  100%,
  0% {
    color: rgb(255, 0, 0);
  }

  8% {
    color: rgb(255, 127, 0);
  }

  16% {
    color: rgb(255, 255, 0);
  }

  25% {
    color: rgb(127, 255, 0);
  }

  33% {
    color: rgb(0, 255, 0);
  }

  41% {
    color: rgb(0, 255, 127);
  }

  50% {
    color: rgb(0, 255, 255);
  }

  58% {
    color: rgb(0, 127, 255);
  }

  66% {
    color: rgb(0, 0, 255);
  }

  75% {
    color: rgb(127, 0, 255);
  }

  83% {
    color: rgb(255, 0, 255);
  }

  91% {
    color: rgb(255, 0, 127);
  }
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
  margin: 1rem;
  margin-bottom: 0;
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
}

.wordsBox {
  text-align: center;
  width: 580px;
  max-width: 580px;
  /* max-height: 500px; */
}

.youWin {
  max-width: 800px;
  font-size: 1rem;
  padding-top: 0;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  /* animation: rainbow 15s linear;
  animation-iteration-count: infinite; */
}

.wordChain {
  text-align: center;
  width: 220px;
  max-width: 220px;
  overflow: auto;

  /* Scrollbar styling for WebKit browsers (Chrome, Edge, Safari, etc.) */
  &::-webkit-scrollbar {
    width: 12px;
    /* Adjust the width of the scrollbar */
  }

  /* Style the scrollbar track (the background of the scrollbar) */
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    /* A light background for the track */
    border-radius: 6px;
    /* Slightly rounded corners for the track */
  }

  /* Style the scrollbar thumb (the draggable part) */
  &::-webkit-scrollbar-thumb {
    background-color: #daa0e994;
    /* Your desired color! */
    border-radius: 6px;
    /* Rounded corners for the thumb */
    border: 2px solid #f1f1f1;
    /* Add a border matching the track for visual separation */
  }

  /* Style the scrollbar thumb on hover for a nice interactive touch */
  &::-webkit-scrollbar-thumb:hover {
    background-color: #c080d094;
    /* A slightly darker shade on hover */
  }

  /* max-height: 500px; */
}

.chainLink {
  padding: .5rem;
  margin-left: .75rem;
  margin-top: 1rem;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);

  /* animation: fadeIn 2s forwards; */
}

@keyframes fadeIn {
  to {}
}

.word {
  display: inline-table;
  width: 500px;
  max-width: 500px;
  top: 100px;
}

@media (max-width: 480px) {
  .screen {
    max-width: 100%;
    max-height: 100%;
    flex-direction: row;
    background: linear-gradient(#daa0e994, #b5a3d58d);
  }

  .wordsBox {
    text-align: center;
    width: 75%;

  }
  .wordChain{ 
    display: none;
  }
  .word {
    display: inline-table;
    width: 75%;
    margin: auto;
    margin-top: 3%;
  }
}
</style>