<template lang="pug">
.v-container.pa-md-4.pt-xs-2.pl-xs-0.pr-xs-0(style='padding: 0 !important')
  // Main content
  v-layout(column, justify-center, align-center)
    h1.h {{ $t("header") }}
    v-container(justify-left)
      h3.t {{ $t("descriprion") }}
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
                    @closeclick='infoWinOpen = false; closeInfoWindow()',
                    :options='infoOptions'
                  )
                  gmap-marker(
                    v-for='(m, i) in markers',
                    :key='i',
                    :position='google && m.position',
                    :clickable='true',
                    @click='toggleInfoWindow(m, i)'
                  )
          transition(name='slide-fade', mode='in-out', style='z-index: 10001')
            v-layout(
              justify-center, align-center
              v-if='isInfoWindowOpened',
              style='position: absolute !important; margin-top: -13vh; z-index: 100; width: 100%'
            )
              v-spacer
              v-btn(x-large color='primary', @click='transition2second()') Continue
              v-spacer
          v-dialog(
            v-model="transition2secondDialog"
            hide-overlay
            persistent
            width="300").mt-12
            v-card(
              color="primary"
              dark)
              v-card-text Fetching avaliable parking slots
                v-progress-linear(
                  indeterminate
                  color="white")
          v-stepper-step(:complete='stepper > 2', step='2') {{ $t("stepper.h2") }}
          v-stepper-content(step='2')
            v-card.mb-12(color='grey lighten-1', height='200px')
              p.t sliders
                v-slider.mt-6(v-model='slider', thumb-label='always')
            v-btn(color='primary', @click='stepper = 3') Continue
            v-btn(text, @click='stepper = 1') Cancel
          v-stepper-step(:complete='stepper > 3', step='3') {{ $t("stepper.h3") }}
          v-stepper-content(step='3')
            v-card.mb-12(color='grey lighten-1', height='200px')
            v-btn(color='primary', @click='stepper = 1') Finish
            v-btn(text, @click='stepper = 2') Cancel
      p and
        a(href='https://www.imdb.com/title/tt0469494/') blood
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
  transition2secondDialog = false

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
  currentMidx: any = null
  currentInfo = undefined

  isInfoWindowOpened = false

  markers = [
    {
      position: { lat: 59.94, lng: 30.35 },
      infoText:
        '<button onclick="alert(\'learn brainfuck\')">BrainFuck!</button>',
    },
    {
      position: { lat: 59.92, lng: 30.25 },
      infoText: '<button onclick="alert(\'потрачено\')">Deep diving!</button>',
    },
  ]

  closeInfoWindow() {
    this.isInfoWindowOpened = false
    console.log('closed')
  }

  toggleInfoWindow(marker: any, idx: number) {
    this.infoWindowPos = marker.position
    this.infoOptions.content = marker.infoText

    //check if its the same marker that was selected if yes toggle
    this.isInfoWindowOpened = true
    if (this.currentMidx == idx) {
      this.infoWinOpen = !this.infoWinOpen
    }
    //if different marker set infowindow to open and reset current marker index
    else {
      this.infoWinOpen = true
      this.currentMidx = idx
    }
  }

  transition2second() {
    this.transition2secondDialog = true
    setTimeout(() => {
      this.transition2secondDialog = false
      this.stepper = 2
      this.isInfoWindowOpened = false
    }, 1500)
  }

  mounted() {}
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

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}
.slide-fade-enter, .slide-fade-leave-to
		/* .slide-fade-leave-active до версии 2.1.8 */ {
  transform: translateY(100vh);
}
</style>
