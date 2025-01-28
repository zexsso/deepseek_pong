<template>
  <div class="container">
    <canvas
      ref="canvas"
      @mousemove="movePaddle"
      @touchmove.prevent="handleTouch"
    ></canvas>

    <div class="controls">
      <button @click="startGame" :disabled="isPlaying">Commencer</button>
      <div class="scores">
        <div>Joueur: {{ playerScore }}</div>
        <div>IA: {{ aiScore }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";

const canvas = ref(null);
const isPlaying = ref(false);
const playerScore = ref(0);
const aiScore = ref(0);

const state = reactive({
  playerY: 300,
  aiY: 300,
  ballX: 400,
  ballY: 300,
  ballSpeedX: 5,
  ballSpeedY: 5,
  paddleHeight: 100,
  paddleWidth: 10,
  canvasWidth: 800,
  canvasHeight: 600,
});

// Configuration initiale
const setupCanvas = () => {
  const ctx = canvas.value.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
};

// Déplacement de la raquette du joueur
const movePaddle = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  state.playerY = e.clientY - rect.top - state.paddleHeight / 2;
};

// Gestion du tactile
const handleTouch = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  state.playerY = e.touches[0].clientY - rect.top - state.paddleHeight / 2;
};

// Intelligence artificielle
const moveAI = () => {
  const aiCenter = state.aiY + state.paddleHeight / 2;
  if (aiCenter < state.ballY - 35) state.aiY += 4;
  if (aiCenter > state.ballY + 35) state.aiY -= 4;
};

// Détection des collisions
const checkCollisions = () => {
  // Collision avec les murs
  if (state.ballY < 0 || state.ballY > state.canvasHeight) {
    state.ballSpeedY = -state.ballSpeedY;
  }

  // Collision avec les raquettes
  const playerCollision =
    state.ballX < state.paddleWidth &&
    state.ballY > state.playerY &&
    state.ballY < state.playerY + state.paddleHeight;

  const aiCollision =
    state.ballX > state.canvasWidth - state.paddleWidth &&
    state.ballY > state.aiY &&
    state.ballY < state.aiY + state.paddleHeight;

  if (playerCollision || aiCollision) {
    state.ballSpeedX = -state.ballSpeedX;
    state.ballSpeedY += Math.random() * 2 - 1; // Ajout d'aléatoire
  }
};

// Logique du jeu
const update = () => {
  if (!isPlaying.value) return;

  moveAI();
  checkCollisions();

  state.ballX += state.ballSpeedX;
  state.ballY += state.ballSpeedY;

  // Reset quand un point est marqué
  if (state.ballX < 0) {
    aiScore.value++;
    resetBall();
  }
  if (state.ballX > state.canvasWidth) {
    playerScore.value++;
    resetBall();
  }

  draw();
  requestAnimationFrame(update);
};

const resetBall = () => {
  isPlaying.value = false;
  state.ballX = state.canvasWidth / 2;
  state.ballY = state.canvasHeight / 2;
  state.ballSpeedX = 0.55 * (Math.random() > 0.5 ? 1 : -1);
  state.ballSpeedY = 0.55 * (Math.random() > 0.5 ? 1 : -1);
};

const draw = () => {
  const ctx = canvas.value.getContext("2d");

  // Effacer le canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

  // Dessiner les raquettes
  ctx.fillStyle = "white";
  ctx.fillRect(0, state.playerY, state.paddleWidth, state.paddleHeight);
  ctx.fillRect(
    state.canvasWidth - state.paddleWidth,
    state.aiY,
    state.paddleWidth,
    state.paddleHeight
  );

  // Dessiner la balle
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, 8, 0, Math.PI * 2);
  ctx.fill();
};

const startGame = () => {
  if (!isPlaying.value) {
    isPlaying.value = true;
    update();
  }
};

// Gestion de la taille du canvas
const handleResize = () => {
  state.canvasWidth = window.innerWidth * 0.8;
  state.canvasHeight = window.innerHeight * 0.7;
  canvas.value.width = state.canvasWidth;
  canvas.value.height = state.canvasHeight;
};

onMounted(() => {
  handleResize();
  setupCanvas();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1a1a1a;
  min-height: 100vh;
  padding: 20px;
}

canvas {
  border: 2px solid white;
  background-color: black;
  touch-action: none;
}

.controls {
  margin-top: 20px;
  color: white;
  display: flex;
  gap: 30px;
  align-items: center;
}

button {
  padding: 10px 20px;
  font-size: 1.2em;
  cursor: pointer;
  background-color: #4caf50;
  border: none;
  border-radius: 5px;
}

button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.scores {
  font-size: 1.5em;
  text-align: center;
}
</style>
