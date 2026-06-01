<template>
    <div class="modal-overlay">
        <div class="modal-box">
            <div class="button" v-if="gameState == 'off'">
                <div class="modalText ">Connect the two daily words by clicking on words in their definitions!</div>
                <base-button @click="startGame()">Start Game!</base-button>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    props: ['gameState'],
    methods: {
        startGame() {
            console.log('modalbutton click!')
            this.$emit('start-game')
        }
    }
};
</script>

<style scoped>
/* 1. THE SHADOW OVERLAY: Spans the whole screen, darkens everything behind it */
.modalText{
    margin-bottom: .75rem;
}
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(50, 39, 69, 0.55);
    /* Your custom purple shadow tint */
    z-index: 1000;
    /* Sits on top of the main website */

    /* Flexbox magic: This automatically centers the modal-box perfectly */
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 2. THE MODAL BOX: The clean, crisp white card in the center */
.modal-box {
    background-color: #b5a3d5; 
    color: #ffffff; 
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35); /* Slightly deeper shadow looks great on dark overlays */
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 1.5rem;
    text-align: center; /* Centers your game rules beautifully */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 500px;
    width: 90%;
}
</style>