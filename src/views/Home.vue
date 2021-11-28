<template lang="pug">
.v-container.pa-md-4.pt-xs-2.pl-xs-0.pr-xs-0(style='padding: 0 !important')
  // Main content
  v-layout(column, justify-center, align-center)
    h1.h.mt-2 {{ $t("header") }}
    v-container.mt-8(justify-left)
      h3.t {{ $t("description") }}
      br
      h6.t {{ $t("disclaimer") }}
      v-stepper#to2.mt-4(v-model='stepper', vertical, color='primary')
        v-stepper-step(:complete='stepper > 1', step='1') {{ $t("stepper.h1") }}
          small {{ $t("stepper.d1") }}
        v-stepper-content#stepper1(
          step='1',
          style='margin: 0; padding: 0 !important'
        )
          v-card.mb-12(flat, color='grey lighten-1', height='70vh')
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
            v-btn.ma-2.mt-0(
              :x-large='!isMobile',
              @click='transition2second(false)',
              color='white',
              style='z-index: 1'
            ) {{ $t("moreTime") }}
            v-btn.ma-2.mt-0(
              x-large,
              color='primary',
              @click='transition2second(true)',
              :loading='transition2secondDialog'
            ) {{ $t("booking") }}
            v-spacer
        v-dialog.mt-12(
          v-model='transition2secondDialog',
          hide-overlay,
          persistent,
          width='300'
        )
          v-card(flat, color='primary', dark)
            v-card-text 
              h5.pt-4.mb-2(style='line-height: 85%') Загружаем информацию о загруженности и о тарифах...
              v-progress-linear(indeterminate, color='white')
        v-stepper-step(:complete='stepper > 2', step='2') {{ $t("stepper.h2") }}
          small {{ $t("stepper.d2") }}
        v-stepper-content.pr-0(
          step='2',
          v-if='isBooking',
          style='margin: 0; padding: 0'
        )
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='340px')
            v-layout.pt-3.pr-md-6.pr-3(:column='isMobile')
              span.t(style='min-width: 300px; align-self: center; z-index: 1') 
                span Время прибытия (приблизительно)
                br
                small.t Чтобы к вашему приезду точно было свободное место
              v-spacer(:v-if='isMobile')
              v-dialog(v-model='isTimePicker', width='500')
                template(v-slot:activator='{ on, attrs }')
                  v-btn.mt-3.mb-3(
                    outlined,
                    v-text='time',
                    style='z-index: 0',
                    v-bind='attrs',
                    v-on='on'
                  )
                v-card
                  v-time-picker(
                    v-model='time',
                    format='24hr',
                    :allowed-minutes='(m) => m % 15 === 0',
                    full-width,
                    @click:minute='isTimePicker = false',
                    color='primary'
                  )
            v-divider.mr-3(style='z-index: 1')
            v-layout.pt-3.pr-md-6(:column='isMobile')
              span.t(
                style='min-width: 200px; align-self: baseline; z-index: 1'
              ) Время парковки (часы)
              v-container.mt-4(row, style='padding: 0')
                v-slider.mt-8(
                  v-model='slider_time',
                  thumb-label='always',
                  @change='SliderChange(false)',
                  step='1',
                  :max='maxSteps',
                  :min='1',
                  ticks='always',
                  tick-size='2',
                  color='primary'
                )
                v-btn(
                  icon,
                  color='primary',
                  style='align-self: center',
                  @click='maxSteps = 24',
                  :disabled='maxSteps === 24'
                )
                  v-icon mdi-plus
            v-divider.mr-3(style='z-index: 1')
            v-layout.mt-6
              v-spacer
              span.t(style='min-width: 100px; align-self: center') Итого
              h3.h.pr-3(
                style='font-weight: 700; min-width: 180px; text-align: right'
              ) {{ display_price }} ₽, {{ time }}→{{ newTime }}
            v-layout
              v-btn.ma-2.mt-3.ml-0(outlined, @click='stepper = 1') Назад
              v-spacer
              v-btn.ma-2.mt-3.ml-0(color='primary', @click='stepper = 3') К оплате
            br
            br
        v-stepper-content.mt-12(step='2', v-else, style='margin: 0')
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='200px')
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
        v-stepper-content.pr-0(step='3', v-if='isBooking', style='margin: 0')
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='200px')
            p 👀
          v-layout
            v-btn(outlined, @click='stepper = 2') Назад
            v-spacer
            v-btn.mr-6(color='primary', @click='stepper = 1') Дебаг баттон
          br
          br
          br
          br
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
  display_price = 360
  slider_time = 3
  time = '12:20'
  maxSteps = 12
  interval: any = false
  isTimePicker = false

  ready() {
    this.display_price = this.slider_price ? this.slider_price : 0
  }

  get isMobile() {
    return window.innerWidth < 600
  }

  get newTime() {
    return (
      ((parseInt(this.time.slice(0, 2)) + this.slider_time) % 24) +
      this.time.slice(2, 5)
    )
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
      position: { lat: 59.917173, lng: 30.349131 },
      infoText:
        '<button onclick="alert(\'learn brainfuck\')">Тюшина, 9/7</button>',
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
    // setTimeout(()=> {
    this.$vuetify.goTo('#to2', {
      duration: 500,
      offset: 25,
      easing: 'easeOutCubic',
    })
    // }, 10)
  }

  transition2second(isBooking: boolean) {
    this.isBooking = isBooking
    this.transition2secondDialog = true
    let date = new Date()
    this.time =
      date.getHours() +
      ':' +
      (date.getMinutes().toString().length === 1
        ? '0' + date.getMinutes()
        : date.getMinutes().toString())
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

  mounted() {
    let isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
    let geocoords = '59.917173,30.349131'
    let infoText = ''
    if (isIOS) {
      infoText = 'maps://?q=' + geocoords, '_system'
    }
    else {
      let label = encodeURI('Тюшина, 9/7') // encode the label!
      infoText = 'geo:0,0?q=' + geocoords + '(' + label + ')'
      // window.open(content, '_system')
    }
    this.markers = [
      {
        position: { lat: 59.917173, lng: 30.349131 },
        infoText:
          `<button onclick="window.open(\'`+infoText+`\')">Тюшина, 9/7</button>`,
      },
    ]
  }
}
</script>

<style>
.h {
  font-family: 'Gilroy', 'WebFont' !important;
  font-weight: 600;
  color: #00349b !important;
}
.t {
  font-family: 'Gilroy', 'WebFont' !important;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9) !important;
  line-height: 90% !important;
}

small {
  font-family: 'Gilroy' !important;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9) !important;
}

p {
  font-family: 'Gilroy' !important;
  font-weight: 500;
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

.gmnoprint,
.gm-control-active,
.gm-fullscreen-control {
  display: none;
}

.v-stepper {
  border-radius: 15px !important;
  /* background: #e0e0e0; */
  box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff !important;
}
button,
.v-dialog {
  border-radius: 6px !important;
  box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff !important;
}
.v-dialog.primary {
  background: linear-gradient(145deg, #0038a6, #002f8c) !important;
}
button.primary {
  background: linear-gradient(145deg, #0038a6, #002f8c) !important;
}
button.white {
  background: linear-gradient(145deg, #ffffff, #e6e6e6) !important;
}
.v-stepper__content {
  padding: 0 !important;
}
.v-stepper__wrapper {
  padding: 16px 0px 16px 23px !important;
  padding-right: 0 !important;
}
#stepper1 > .v-stepper__wrapper {
  padding: 0 !important;
}
</style>
