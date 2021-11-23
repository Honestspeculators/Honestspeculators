<template lang="pug">
.v-container.pa-4
  // Main content
  v-layout(column, justify-center, align-center)
    h1.h Hello there!
    v-container(justify-left)
      h3.t there'll be:
      p.t sliders
        v-slider(v-model='slider', thumb-label='always')
      p.t steppers
        v-stepper(v-model='stepper', vertical)
          v-stepper-step(:complete='stepper > 1', step='1') Select an app
            small Summarize if needed
          v-stepper-content(step='1')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 2') Continue
            v-btn(text) Cancel
          v-stepper-step(:complete='stepper > 2', step='2') Configure analytics for this app
          v-stepper-content(step='2')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 3') Continue
            v-btn(text, @click='stepper = 1') Cancel
          v-stepper-step(:complete='stepper > 3', step='3') Select an ad format and name ad unit
          v-stepper-content(step='3')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 4') Continue
            v-btn(text, @click='stepper = 2') Cancel
          v-stepper-step(step='4') View setup instructions
          v-stepper-content(step='4')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 1') Continue
            v-btn(text, @click='stepper = 3') Cancel
      p and 
        a(href="https://www.imdb.com/title/tt0469494/") blood
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import Component from 'vue-class-component'
import { i18n } from '@/plugins/i18n'
import { namespace } from 'vuex-class'
import { User } from '@/models/User'

const AppStore = namespace('AppStore')
const SnackbarStore = namespace('SnackbarStore')

@Component({})
export default class Home extends Vue {
  @AppStore.Mutation setUser!: (user: User) => void
  @SnackbarStore.Mutation setSnackbarError!: (error: string) => void

  slider = 45
  stepper = 1
}
</script>

<style>
.h {
  font-family: 'Gilroy SemiBold' !important;
  color: #00349b;
}
.t {
  font-family: 'Gilroy Medium' !important;
  color: rgba(0, 0, 0, 0.9);
}

small {
  font-family: 'Gilroy Medium' !important;
}

p {
  font-family: 'Gilroy Medium' !important;
}
</style>
