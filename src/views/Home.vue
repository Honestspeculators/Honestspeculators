<template lang="pug">
.v-container.pa-md-4.pt-xs-2.pl-xs-0.pr-xs-0(style='padding: 0 !important')
  // Main content
  v-layout(column, justify-center, align-center)
    h1.h {{ $t("header") }}
    v-container(justify-left)
      h3.t {{ $t("description") }}
      small.t.mt-6 {{ $t("disclaimer") }}
      v-stepper(v-model='stepper', vertical)
        v-stepper-step(:complete='stepper > 1', step='1') {{ $t("stepper.h1") }}
          small {{ $t("stepper.d1") }}
        v-stepper-content(step='1' style="margin: 0; padding: 0 !important")
          v-card.mb-12(flat color='grey lighten-1', height='70vh')
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
            justify-center,
            align-center,
            v-if='isInfoWindowOpened',
            style='position: absolute !important; margin-top: -10vh; z-index: 100; width: 100%',
            :column='isMobile'
          )
            v-spacer
            v-btn.ma-2.mt-0(:x-large='!isMobile', @click='transition2second(false)') {{ $t("moreTime") }}
            v-btn.ma-2.mt-0(
              x-large,
              color='primary',
              @click='transition2second(true)',
              :loading='transition2secondDialog',
            ) {{ $t("booking") }}
            v-spacer
        v-dialog.mt-12(
          v-model='transition2secondDialog',
          hide-overlay,
          persistent,
          width='300'
        )
          v-card(flat color='primary', dark)
            v-card-text 
              h5 Загружаем информацию о загруженности и о тарифах...
              v-progress-linear(indeterminate, color='white')
        v-stepper-step(:complete='stepper > 2', step='2') {{ $t("stepper.h2") }}
          small {{ $t("stepper.d2") }}
        v-stepper-content(step='2', v-if='isBooking', style="margin: 0").pr-0
          v-card.mb-12.pa-md-8.pa-xs-2.pt-4(flat, height='200px')
            v-layout.pt-3(:column="isMobile")
              span.t(style='min-width: 200px; align-self: center;') Время парковки (часы)
              v-container(row)
                v-slider.mt-8(
                  v-model='slider_time',
                  thumb-label='always',
                  @change='SliderChange(false)',
                  step='1',
                  :max='maxSteps',
                  :min='1',
                  ticks="always",
                  tick-size="2",
                )
                v-btn(icon color='primary' style='align-self: center' @click='maxSteps=24' :disabled='maxSteps === 24')
                  v-icon mdi-plus
            v-layout
              span.t(style='min-width: 100px') Цена
              h3.h(style='font-weight: 700') {{ display_price }} ₽
          v-btn(color='primary', @click='stepper = 3') К оплате
          v-btn(text, @click='stepper = 1') Назад
        v-stepper-content(step='2', v-else, style="margin: 0")
          v-card.mb-12.pa-8(flat, height='200px')
            h3.t Введите номер парковочного талона
            v-otp-input(
              length='6',
              type='number',
              v-model='otp',
              style='max-width: 400px',
              @finish='isFinishedOTP()',
              :disabled='isLoadingOTP'
            )
            v-btn(
              :disabled='!isActiveOTP()',
              :loading='isLoadingOTP',
              x-large,
              color='primary'
            ) Далее
            v-btn(text, @click='stepper = 1', x-large) Назад
        v-stepper-step(:complete='stepper > 3', step='3', v-if='isBooking') {{ $t("stepper.h3") }}
          small {{ $t("stepper.d3") }}
        v-stepper-content(step='3', v-if='isBooking', style="margin: 0")
          v-card.mb-12(flat, color='grey lighten-1', height='200px')
          v-btn(color='primary', @click='stepper = 1') Дебаг баттон
          v-btn(text, @click='stepper = 2') Назад
</template>

<script lang="ts">
import Vue from 'vue'
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

  slider_price = 300
  display_price = 45
  slider_time = 2.5
  maxSteps = 12
  interval: any = false

  ready() {
    this.display_price = this.slider_price ? this.slider_price : 0
  }

  get isMobile() {
    return window.innerWidth < 600
  }

  stepper = 1
  transition2secondDialog = false
  otp = ''
  isLoadingOTP = false

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

  isBooking = true

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

  transition2second(isBooking: boolean) {
    this.isBooking = isBooking
    this.transition2secondDialog = true
    setTimeout(() => {
      this.transition2secondDialog = false
      this.stepper = 2
      this.isInfoWindowOpened = false
    }, 1500)
  }

  SliderChange(isPrice) {
    if (isPrice) this.slider_time = this.slider_price / 2 / 60
    else this.slider_price = this.slider_time * 60 * 2
    this.number()
  }

  number() {
    clearInterval(this.interval)
    if (this.slider_price == this.display_price) {
      return
    }
    this.interval = window.setInterval(() => {
      if (this.display_price != this.slider_price) {
        var change = (this.slider_price - this.display_price) / 10
        change = change >= 0 ? Math.ceil(change) : Math.floor(change)
        this.display_price = this.display_price + change
      }
    }, 20)
  }

  isActiveOTP() {
    return this.otp.length === 6
  }

  FinishedOTP() {
    this.isLoadingOTP = true
    setTimeout(() => {
      this.isLoadingOTP = false
    }, 1500)
  }

  mounted() {}
}
</script>

<style>
.h {
  font-family: 'Gilroy SemiBold' !important;
  color: #00349b !important;
}
.t {
  font-family: 'Gilroy Medium' !important;
  color: rgba(0, 0, 0, 0.9) !important;
}

small {
  font-family: 'Gilroy Medium' !important;
  color: rgba(0, 0, 0, 0.9) !important;
}

p {
  font-family: 'Gilroy Medium' !important;
  color: rgba(0, 0, 0, 0.9) !important;
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
