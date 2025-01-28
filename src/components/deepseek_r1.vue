<template>
  <div
    class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4"
  >
    <!-- Canvas du jeu -->
    <canvas
      ref="canvas"
      class="border-2 border-gray-700 bg-black rounded-lg touch-none mb-4"
      @mousemove="movePaddle"
      @touchmove.prevent="handleTouch"
    ></canvas>

    <!-- Conteneur principal des contrôles -->
    <div
      class="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-center justify-center"
    >
      <!-- Paramètres du jeu -->
      <div
        v-if="!isPlaying"
        class="bg-gray-800 p-6 rounded-lg w-full md:max-w-md"
      >
        <h2 class="text-2xl font-bold text-white mb-4">Paramètres</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Vitesse initiale</label
            >
            <input
              v-model.number="settings.initialSpeed"
              type="range"
              min="3"
              max="10"
              class="w-full mt-1 range range-xs range-primary"
            />
            <span class="text-white text-sm"
              >{{ settings.initialSpeed }} px/frame</span
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Accélération</label
            >
            <input
              v-model.number="settings.speedIncrement"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              class="w-full mt-1 range range-xs range-primary"
            />
            <span class="text-white text-sm"
              >+{{ settings.speedIncrement }} px/frame</span
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Vitesse max</label
            >
            <input
              v-model.number="settings.maxSpeed"
              type="range"
              min="10"
              max="20"
              class="w-full mt-1 range range-xs range-primary"
            />
            <span class="text-white text-sm"
              >{{ settings.maxSpeed }} px/frame</span
            >
          </div>
        </div>
      </div>

      <!-- Contrôles et scores -->
      <div class="flex flex-col items-center gap-6 w-full md:max-w-xs">
        <button
          @click="toggleGame"
          class="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors w-full text-lg font-semibold"
        >
          {{ isPlaying ? "Arrêter la partie" : "Commencer à jouer" }}
        </button>

        <div class="bg-gray-800 p-6 rounded-lg w-full">
          <div class="text-white space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-300">Joueur:</span>
              <span class="text-2xl font-bold text-emerald-400">{{
                playerScore
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300">IA:</span>
              <span class="text-2xl font-bold text-red-400">{{ aiScore }}</span>
            </div>
          </div>
        </div>
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

const settings = reactive({
  initialSpeed: 5,
  speedIncrement: 0.5,
  maxSpeed: 15,
});

const game = reactive({
  playerY: 300,
  aiY: 300,
  ballX: 400,
  ballY: 300,
  ballSpeedX: 0,
  ballSpeedY: 0,
  paddleHeight: 100,
  paddleWidth: 10,
  canvasWidth: 800,
  canvasHeight: 600,
});

// Configuration initiale
const setupCanvas = () => {
  const ctx = canvas.value.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
};

const movePaddle = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  const y = e.clientY - rect.top - game.paddleHeight / 2;
  game.playerY = Math.max(
    0,
    Math.min(y, game.canvasHeight - game.paddleHeight)
  );
};

const handleTouch = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  const y = e.touches[0].clientY - rect.top - game.paddleHeight / 2;
  game.playerY = Math.max(
    0,
    Math.min(y, game.canvasHeight - game.paddleHeight)
  );
};

const moveAI = () => {
  const aiCenter = game.aiY + game.paddleHeight / 2;
  const prediction =
    game.ballY +
    (game.ballSpeedY * (game.canvasWidth - game.ballX)) / game.ballSpeedX;
  const targetY = Math.max(
    0,
    Math.min(prediction, game.canvasHeight - game.paddleHeight)
  );

  if (aiCenter < targetY - 10) game.aiY += 5;
  if (aiCenter > targetY + 10) game.aiY -= 5;
};

const checkCollisions = () => {
  // Collision avec les murs
  if (game.ballY < 0 || game.ballY > game.canvasHeight) {
    game.ballSpeedY = -game.ballSpeedY;
    game.ballY = Math.max(10, Math.min(game.ballY, game.canvasHeight - 10));
  }

  // Collision avec les raquettes
  const playerCollision =
    game.ballX < game.paddleWidth + 8 &&
    game.ballY > game.playerY - 8 &&
    game.ballY < game.playerY + game.paddleHeight + 8;

  const aiCollision =
    game.ballX > game.canvasWidth - game.paddleWidth - 8 &&
    game.ballY > game.aiY - 8 &&
    game.ballY < game.aiY + game.paddleHeight + 8;

  if (playerCollision || aiCollision) {
    // Calcul de l'angle de rebond
    const paddleCenter =
      (playerCollision ? game.playerY : game.aiY) + game.paddleHeight / 2;
    const relativeIntersect =
      (paddleCenter - game.ballY) / (game.paddleHeight / 2);
    const bounceAngle = relativeIntersect * (Math.PI / 3);

    // Application de la vitesse
    const speed = Math.min(
      Math.sqrt(game.ballSpeedX ** 2 + game.ballSpeedY ** 2) +
        settings.speedIncrement,
      settings.maxSpeed
    );

    game.ballSpeedX =
      speed * Math.cos(bounceAngle) * (playerCollision ? 1 : -1);
    game.ballSpeedY = speed * -Math.sin(bounceAngle);
  }
};

const update = () => {
  console.log("update");
  console.log(isPlaying.value);
  if (!isPlaying.value) return;

  moveAI();
  checkCollisions();

  game.ballX += game.ballSpeedX;
  game.ballY += game.ballSpeedY;

  if (game.ballX < -20 || game.ballX > game.canvasWidth + 20) {
    if (game.ballX < 0) aiScore.value++;
    if (game.ballX > game.canvasWidth) playerScore.value++;
    resetBall();
  }

  draw();
  requestAnimationFrame(update);
};

const resetBall = () => {
  game.ballX = game.canvasWidth / 2;
  game.ballY = game.canvasHeight / 2;
  const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
  const speed = settings.initialSpeed;
  game.ballSpeedX = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
  game.ballSpeedY = speed * Math.sin(angle);
};

const draw = () => {
  const ctx = canvas.value.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

  // Raquettes
  ctx.fillStyle = "white";
  ctx.fillRect(0, game.playerY, game.paddleWidth, game.paddleHeight);
  ctx.fillRect(
    game.canvasWidth - game.paddleWidth,
    game.aiY,
    game.paddleWidth,
    game.paddleHeight
  );

  console.log(game.ballX, game.ballY);

  // Balle
  ctx.beginPath();
  ctx.arc(game.ballX, game.ballY, 8, 0, Math.PI * 2);
  ctx.fill();
};

const toggleGame = () => {
  isPlaying.value = !isPlaying.value;
  console.log(isPlaying.value);

  if (isPlaying.value) {
    playerScore.value = 0;
    aiScore.value = 0;
    resetBall();
    update();
  }
};

const handleResize = () => {
  game.canvasWidth = Math.min(window.innerWidth * 0.9, 1000);
  game.canvasHeight = Math.min(window.innerHeight * 0.6, 700);
  canvas.value.width = game.canvasWidth;
  canvas.value.height = game.canvasHeight;
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
