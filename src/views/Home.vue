<template lang="pug">
.v-container.pa-md-4.pt-xs-2.pl-xs-0.pr-xs-0(style='padding: 0 !important')
  // Main content
  v-layout(column, justify-center, align-center)
    h1.h {{ $t("header") }}
    v-container(justify-left)
      h3.t {{ $t("descriprion") }}
      p.t sliders
        v-slider(v-model='slider', thumb-label='always')
      p.t steppers with maps!
        v-stepper(v-model='stepper', vertical)
          v-stepper-step(:complete='stepper > 1', step='1') {{ $t("stepper.h1") }}
            small Summarize if needed
          v-stepper-content(step='1')
            v-card.mb-12(color='grey lighten-1', height='70vh')
              div
                google-map#map(
                  v-if='google',
                  :center='mapCenter',
                  :zoom='mapZoom',
                  ref='mapRef',
                  style='height: 70vh; width: 100vw; z-index: 1'
                )
                  gmap-info-window(
                    :position='infoWindowPos',
                    :opened='infoWinOpen',
                    @closeclick='infoWinOpen = false',
                    :options='infoOptions'
                  )
                  gmap-marker(
                    v-for='(m, i) in markers',
                    :key='i',
                    :position='google && m.position',
                    :clickable='true',
                    @click='toggleInfoWindow(m, i)',
                  )
              v-btn.mt-2(color='primary', @click='stepper = 2') Continue
              v-btn.mt-2(text) Cancel
          v-stepper-step(:complete='stepper > 2', step='2') {{ $t("stepper.h2") }}
          v-stepper-content(step='2')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 3') Continue
            v-btn(text, @click='stepper = 1') Cancel
          v-stepper-step(:complete='stepper > 3', step='3') {{ $t("stepper.h3") }}
          v-stepper-content(step='3')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 1') Continue
            v-btn(text, @click='stepper = 2') Cancel
      p and
        a(href='https://www.imdb.com/title/tt0469494/') blood
      p and maps
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import Component from 'vue-class-component'
import { i18n } from '@/plugins/i18n'
import { namespace } from 'vuex-class'
import * as VueGoogleMaps from 'vue2-google-maps'
import { gmapApi } from 'vue2-google-maps'
import { loaded } from 'vue2-google-maps'
import { User } from '@/models/User'

const AppStore = namespace('AppStore')
const SnackbarStore = namespace('SnackbarStore')

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GMAPS,
    v: '3.47',
  },
  installComponents: false,
})
Vue.component('google-map', VueGoogleMaps.Map)
Vue.component('gmap-info-window', VueGoogleMaps.InfoWindow)
Vue.component('gmap-marker', VueGoogleMaps.Marker)

@Component({})
export default class Home extends Vue {
  @AppStore.Mutation setUser!: (user: User) => void
  @SnackbarStore.Mutation setSnackbarError!: (error: string) => void

  slider = 45
  stepper = 1
  mapCenter = { lat: 59.95, lng: 30.3 }
  mapZoom = 12
  get google() {
    return gmapApi
  }

  infoOptions = {
    content: '',
    //optional: offset infowindow so it visually sits nicely on top of our marker
    pixelOffset: {
      width: 0,
      height: -35,
    },
  }
  infoOptionsM = {
    content: '',
    //optional: offset infowindow so it visually sits nicely on top of our marker
  }
  infoWindowPos = null
  infoWinOpenMine = false
  infoWinOpen = false
  currentMidx:any = null
  currentInfo = undefined

  markers = [
    {
      position: { lat: 59.94, lng: 30.35 },
      infoText: '<button onclick="alert(\'learn brainfuck\')">BrainFuck!</button>',
    },
  ]

  toggleInfoWindow(marker: any, idx: number) {
    this.infoWindowPos = marker.position
    this.infoOptions.content = marker.infoText

    //check if its the same marker that was selected if yes toggle
    if (this.currentMidx == idx) {
      this.infoWinOpen = !this.infoWinOpen
    }
    //if different marker set infowindow to open and reset current marker index
    else {
      this.infoWinOpen = true
      this.currentMidx = idx
    }
  }

  mounted() {
    console.log(process.env)
    console.log(process.env.VUE_APP_GMAPS)
  }
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
