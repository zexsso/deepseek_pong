<template>
  <div class="flex flex-col w-screen h-screen">
    <div
      v-if="!selectedGame"
      class="flex flex-col justify-center items-center h-full"
    >
      <h1 class="text-2xl font-bold mb-6">Choisissez votre jeu :</h1>
      <div class="flex space-x-4">
        <button
          class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="chooseGame('deepseek_r1')"
        >
          Deepsee R1
        </button>

        <button
          class="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          @click="chooseGame('openai_o1')"
        >
          OpenAI O1
        </button>
      </div>
    </div>

    <!-- Affiche le jeu choisi -->
    <div
      v-if="selectedGame"
      class="mx-auto flex flex-col items-center justify-center"
    >
      <div class="flex justify-center items-center gap-4">
        <p class="text-xl">
          Vous avez choisi : <strong>{{ selectedGame }}</strong>
        </p>
        <button
          class="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-300"
          @click="selectedGame = null"
        >
          Return
        </button>
      </div>

      <!-- Ici vous pouvez afficher un composant de jeu conditionnel, par exemple : -->
      <deepseek_r1 v-if="selectedGame === 'deepseek_r1'" />
      <openai_o1 v-if="selectedGame === 'openai_o1'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import deepseek_r1 from "./components/deepseek_r1.vue";
import openai_o1 from "./components/openai_o1.vue";

const selectedGame = ref(null);

function chooseGame(gameName) {
  selectedGame.value = gameName;
}
</script>
