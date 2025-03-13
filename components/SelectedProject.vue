<template>
    <div class="flex flex-row justify-between">
      <div class="flex flex-col w-1/2 justify-between">
        <div class="flex flex-row justify-between mr-4 text-right">
          <div class="text-6xl font-semibold secondary-color">{{ datePrincipal }}</div>
          <div class="flex flex-col">
            <div class="secondary-color font-semibold">
              {{ annee }}
            </div>
            <div class="font-medium" v-html="services"></div>
          </div>
        </div>
        <div class="w-128 font-medium">
          {{ description }}
        </div>
        <div class="text-4xl font-semibold secondary-color underline cursor-pointer w-fit" @click="onTitleClick">
          {{ titre }}
        </div>
      </div>
      <div class="w-1/2">
        <div class="bg-slate-300 w-full h-114 rounded-lg" v-if="!imageUrl"></div>
        <img v-else :src="imageUrl" class="w-full h-114 rounded-lg object-cover" :alt="titre" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProjetCard',
    props: {
      // Date principale affichée en grand (ex: "01/02")
      datePrincipal: {
        type: String,
        default: '01/02'
      },
      // Année du projet
      annee: {
        type: String,
        default: '2024'
      },
      // Services fournis (peut contenir du HTML pour le saut de ligne)
      services: {
        type: String,
        default: 'Interactive Design <br /> Full Development'
      },
      // Description du projet
      description: {
        type: String,
        default: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!'
      },
      // Titre du projet
      titre: {
        type: String,
        default: 'Mouvements & Harmonie'
      },
      // URL de l'image (optionnelle)
      imageUrl: {
        type: String,
        default: ''
      }
    },
    methods: {
      onTitleClick() {
        this.$emit('title-click', this.titre);
      }
    }
  }
</script>