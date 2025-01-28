<template>
  <div class="flex flex-col items-center gap-6 p-4">
    <!-- Titre du jeu -->
    <h1 class="text-2xl font-bold">Jeu du Pong</h1>

    <!-- Panneau de configuration -->
    <div class="flex flex-col items-start gap-4 p-4 border rounded-md shadow-sm w-full max-w-md">
      <h2 class="text-lg font-semibold">Paramètres de la partie</h2>

      <!-- Vitesse de la balle -->
      <label class="flex items-center gap-2">
        <span class="w-40">Vitesse de la balle :</span>
        <input
          type="range"
          min="1"
          max="10"
          v-model="settings.ballSpeed"
          class="w-64"
        />
        <span>{{ settings.ballSpeed }}</span>
      </label>

      <!-- Vitesse de l'IA -->
      <label class="flex items-center gap-2">
        <span class="w-40">Vitesse IA :</span>
        <input
          type="range"
          min="1"
          max="10"
          v-model="settings.aiSpeed"
          class="w-64"
        />
        <span>{{ settings.aiSpeed }}</span>
      </label>

      <!-- Démarrer / Recommencer la partie -->
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        @click="resetGame"
      >
        Recommencer
      </button>
    </div>

    <!-- Zone de jeu -->
    <div class="relative">
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="border border-gray-300 bg-gray-100"
        @mousemove="handleMouseMove"
      ></canvas>
      <!-- Score -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 mt-2 text-xl font-bold bg-white px-2 py-1 rounded shadow"
      >
        {{ playerScore }} : {{ aiScore }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'

// ========================
//  Références et variables
// ========================
const canvas = ref(null)
const ctx = ref(null)

const canvasWidth = 600
const canvasHeight = 400

// Positions et dimensions des raquettes
const paddleWidth = 10
const paddleHeight = 60

// Réactive pour stocker les réglages
const settings = reactive({
  ballSpeed: 5, // vitesse de la balle (modifiable via le slider)
  aiSpeed: 3,   // vitesse de déplacement de l'IA
})

// Scores
let playerScore = ref(0)
let aiScore = ref(0)

// Position raquette Joueur
let playerPaddleY = ref(canvasHeight / 2 - paddleHeight / 2)

// Position raquette IA
let aiPaddleY = ref(canvasHeight / 2 - paddleHeight / 2)

// Balle
let ballX = ref(canvasWidth / 2)
let ballY = ref(canvasHeight / 2)
let ballRadius = 8

// Vitesse de la balle sur X et Y (direction)
let ballSpeedX = ref(settings.ballSpeed)
let ballSpeedY = ref(settings.ballSpeed)

// Pour contrôler l'animation
let animationFrameId = null

// ========================
//     Fonctions utiles
// ========================

// Réinitialise la partie (score, position de balle, etc.)
function resetGame() {
  playerScore.value = 0
  aiScore.value = 0
  resetBall()
}

// Replace la balle au centre et lui donne une direction aléatoire
function resetBall() {
  ballX.value = canvasWidth / 2
  ballY.value = canvasHeight / 2
  // Direction aléatoire : soit vers la gauche, soit vers la droite
  let directionX = Math.random() < 0.5 ? -1 : 1
  let directionY = Math.random() < 0.5 ? -1 : 1
  ballSpeedX.value = directionX * settings.ballSpeed
  ballSpeedY.value = directionY * settings.ballSpeed
}

// Gère le mouvement de la souris pour déplacer la raquette du joueur
function handleMouseMove(e) {
  const rect = canvas.value.getBoundingClientRect()
  const mouseY = e.clientY - rect.top
  // Centrer la raquette là où la souris est
  playerPaddleY.value = mouseY - paddleHeight / 2
  // Assurer de ne pas sortir du canvas
  if (playerPaddleY.value < 0) {
    playerPaddleY.value = 0
  } else if (playerPaddleY.value + paddleHeight > canvasHeight) {
    playerPaddleY.value = canvasHeight - paddleHeight
  }
}

// Moteur de jeu : update + draw
function gameLoop() {
  update()
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

// Met à jour les positions, collisions, etc.
function update() {
  // Déplacement de la balle
  ballX.value += ballSpeedX.value
  ballY.value += ballSpeedY.value

  // Collision avec le haut/bas du canvas
  if (ballY.value - ballRadius < 0 || ballY.value + ballRadius > canvasHeight) {
    ballSpeedY.value = -ballSpeedY.value
  }

  // Collision avec la raquette du joueur
  if (
    ballX.value - ballRadius <= paddleWidth &&
    ballY.value >= playerPaddleY.value &&
    ballY.value <= playerPaddleY.value + paddleHeight
  ) {
    // Inverse la direction en X
    ballSpeedX.value = -ballSpeedX.value
    // Légère augmentation de la vitesse pour corser le jeu
    ballSpeedX.value *= 1.05
    ballSpeedY.value *= 1.05
  }

  // Collision avec la raquette IA
  if (
    ballX.value + ballRadius >= canvasWidth - paddleWidth &&
    ballY.value >= aiPaddleY.value &&
    ballY.value <= aiPaddleY.value + paddleHeight
  ) {
    ballSpeedX.value = -ballSpeedX.value
    ballSpeedX.value *= 1.05
    ballSpeedY.value *= 1.05
  }

  // Sortie à gauche -> IA marque un point
  if (ballX.value - ballRadius < 0) {
    aiScore.value += 1
    resetBall()
  }

  // Sortie à droite -> Joueur marque un point
  if (ballX.value + ballRadius > canvasWidth) {
    playerScore.value += 1
    resetBall()
  }

  // Mouvement de l'IA : se déplace pour suivre la balle
  if (ballY.value < aiPaddleY.value + paddleHeight / 2) {
    aiPaddleY.value -= settings.aiSpeed
  } else if (ballY.value > aiPaddleY.value + paddleHeight / 2) {
    aiPaddleY.value += settings.aiSpeed
  }
  // Empêcher l'IA de sortir du terrain
  if (aiPaddleY.value < 0) {
    aiPaddleY.value = 0
  } else if (aiPaddleY.value + paddleHeight > canvasHeight) {
    aiPaddleY.value = canvasHeight - paddleHeight
  }
}

// Dessine le contenu dans le canvas
function draw() {
  // Nettoyer le canvas
  ctx.value.clearRect(0, 0, canvasWidth, canvasHeight)

  // Dessiner la balle
  ctx.value.beginPath()
  ctx.value.arc(ballX.value, ballY.value, ballRadius, 0, Math.PI * 2)
  ctx.value.fillStyle = 'black'
  ctx.value.fill()
  ctx.value.closePath()

  // Dessiner la raquette du joueur
  ctx.value.fillStyle = 'blue'
  ctx.value.fillRect(0, playerPaddleY.value, paddleWidth, paddleHeight)

  // Dessiner la raquette de l'IA
  ctx.value.fillStyle = 'red'
  ctx.value.fillRect(canvasWidth - paddleWidth, aiPaddleY.value, paddleWidth, paddleHeight)
}

// ========================
//   Cycle de vie du composant
// ========================
onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  resetGame()     // Initialise scores et position de la balle
  gameLoop()      // Démarre l’animation
})

onBeforeUnmount(() => {
  // Annule l’animation quand on quitte le composant
  cancelAnimationFrame(animationFrameId)
})
</script>
