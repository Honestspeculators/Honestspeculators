<template lang="pug">
.v-container.pa-md-4.pt-xs-2.pl-xs-0.pr-xs-0(style='padding: 0 !important')
  // Main content
  v-layout(column, justify-center, align-center)
    v-container(justify-left)
      h1.h.mt-md-12.pt-sm-2.pt-xs-2 {{ $t("header") }}
      h3.t.pt-8(style='font-weight: 600') {{ $t("description") }}
      br
      h6.t {{ $t("disclaimer") }}
      v-stepper#to2.mt-4(v-model='stepper', vertical, color='primary')
        v-stepper-step(:complete='stepper > 1', step='1') {{ $t("stepper.h1") }}
          small {{ $t("stepper.d1") }}
        v-stepper-content#stepper1(
          step='1',
          :style="stepper === 1 ? 'margin: 0; padding: 0 !important' : 'padding: 0 !important'"
        )
          v-card.mb-12(flat, color='grey lighten-1', height='70vh')
            div
              google-map#map.mt-4(
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
              :loading='transition2secondTimeDialog',
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
              h5.pt-4.mb-2(style='line-height: 85%') {{ $t("dialog2") }}
              v-progress-linear(indeterminate, color='white')
        v-stepper-step(:complete='stepper > 2', step='2') {{ isBooking ? $t("stepper.h2") : $t("stepper.h2T") }}
          small {{ isBooking ? $t("stepper.d2") : $t("stepper.d2T") }}
        v-stepper-content.pr-0(
          step='2',
          v-if='isBooking',
          :style="stepper === 2 ? 'margin: 0; padding: 0 !important' : 'padding: 0 !important'"
        )
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='420px')
            v-layout.pt-3.pr-3(:column='isMobile')
              span.t(style='min-width: 260px; align-self: center; z-index: 1') 
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
                    color='primary'
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
            v-layout.pt-6.pr-md-6(:column='isMobile')
              span.t(
                :style='isMobile ? "min-width: 200px; align-self: baseline; z-index: 1" : "min-width: 200px; align-self: center; z-index: 1"'
              ) 
                span Время парковки (часы)
                br
                small.t Сдвиньте ползунок для регулировки
              v-container.mt-4(row, style='padding: 0')
                v-slider.mt-8(
                  v-model='slider_time',
                  thumb-label='always',
                  @change='SliderChange()',
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
                style='font-weight: 600; min-width: 170px; text-align: right'
              ) {{ display_price }} ₽, {{ time }}→{{ newTime }}
            v-layout
              v-btn.ma-2.mt-3.ml-0(outlined, @click='stepper = 1', x-large) Назад
              v-spacer
              v-btn.ma-2.mt-3.ml-0(
                color='primary',
                @click='transition2third',
                x-large
              ) К оплате
            br
            br
        v-stepper-content.mt-1(step='2', v-else, :style="stepper === 2 ? 'margin: 0' : ''")
          v-card#otp.mb-12.pb-12.pa-md-8.pa-xs-2.pb-2.mt-4(flat, height='380px')
            v-layout.pr-md-6(:column='isMobile')
              span.t(
                :style='isMobile ? "min-width: 200px; align-self: baseline; z-index: 1" : "min-width: 200px; align-self: center; z-index: 1"'
              )
                span Введите номер парковочного талона
              v-spacer(:v-if='isMobile')
              v-otp-input#otp(
                length='6',
                type='number',
                v-model='otp',
                style='max-width: 260px',
                @finish='FinishedOTP()',
                :disabled='isLoadingOTP',
                ref='otp',
                color='primary'
              )
            v-layout.pt-6.pr-md-6(:column='isMobile')
              span.t(
                :style='isMobile ? "min-width: 200px; align-self: baseline; z-index: 1" : "min-width: 200px; align-self: center; z-index: 1"'
              )
                span На сколько продлить время парковки (часы)
              v-container.mt-4(row, style='padding: 0')
                v-slider.mt-8(
                  v-model='slider_time',
                  thumb-label='always',
                  @change='SliderChange()',
                  step='1',
                  :max='8',
                  :min='1',
                  ticks='always',
                  tick-size='2',
                  color='primary',
                  :disabled='!isActiveOTP()'
                )
                  v-icon mdi-plus
            v-divider.mr-3(style='z-index: 1')
            v-layout.mt-6
              v-spacer
              span.t(style='min-width: 100px; align-self: center') Итого
              h3.h.pr-3(
                v-if='!(!isActiveOTP() || isLoadingOTP)',
                style='font-weight: 600; min-width: 170px; text-align: right'
              ) {{ display_price }} ₽, {{ time }}→{{ newTime }}
              v-skeleton-loader.pr-3(
                v-else,
                v-bind='attrs',
                type='actions',
                style='font-weight: 600; min-width: 170px; text-align: right'
              ) 
            v-layout
              v-btn.ma-2.mt-3.ml-0(outlined, @click='stepper = 1', x-large) Назад
              v-spacer
              v-btn.ma-2.mt-3.ml-0(
                :disabled='!isActiveOTP()',
                :loading='isLoadingOTP',
                x-large,
                color='primary'
                @click='transition2third',
              ) {{ !(!isActiveOTP() || isLoadingOTP) ? 'К оплате' : 'Далее'}}
        v-stepper-step(:complete='stepper > 3', step='3') {{ $t("stepper.h3") }}
          small {{ $t("stepper.d3") }}
        v-stepper-content.pr-0(step='3', style='margin: 0')
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='420px')
            v-form(v-model='form', v-if='isBooking')
              v-container
                v-row
                  v-col.pl-0.pt-0(cols='12', md='4')
                    v-text-field(
                      :rules='nameRules',
                      label='Имя',
                      required,
                      ref='name'
                    )
                v-row
                  v-col.pl-0.pt-0.mt-0(cols='12', md='4')
                    v-text-field(
                      :rules='nameRules',
                      label='E-mail',
                      placeholder='Пишите, что пожелаете',
                      required
                    )
            v-layout.pb-3(:style='isMobile ? "" : "max-width: 350px"')
              h3.h.pr-3(
                style='font-weight: 600; min-width: 80px; text-align: left'
              ) {{ time }}→{{ newTime }}
              v-spacer
              h3.h.pr-3(
                style='font-weight: 600; min-width: 80px; text-align: right'
              ) {{ display_price }} ₽
            v-container#pay.pl-0(
              :style='(form || !isBooking) ? "filter: none" : "filter: grayscale(1)"'
            )
              v-btn.pl-0(
                icon,
                :disabled='!form && isBooking',
                @click='transition2fourth',
                style='width: 100%; max-width: min(350px, 85vw)'
              )
                v-img(
                  :src='require("../assets/sberpay.png")',
                  style='width: 100%; max-width: min(350px, 85vw)'
                )
              br
              v-btn.mt-8.mt-md-12.pl-0(
                icon,
                :disabled='!form && isBooking',
                @click='transition2fourth',
                style='width: 100%; max-width: min(350px, 85vw)'
              )
                v-img(
                  :src='require("../assets/gpay.png")',
                  style='width: 100%; max-width: min(350px, 85vw)'
                )
              br
              v-btn.mt-8.mt-md-12.pl-0(
                icon,
                :disabled='!form && isBooking',
                @click='transition2fourth',
                style='width: 100%; max-width: min(350px, 85vw)'
              )
                v-img(
                  :src='require("../assets/applepay.png")',
                  style='width: 100%; max-width: min(350px, 85vw)'
                )
              br
              br
              small Нажимайте, не стесняйтесь
          v-layout.pt-12
            v-btn(outlined, @click='stepper = 2') Назад
            v-spacer
            //- v-btn.mr-6(color='primary', @click='stepper = 1') Дебаг баттон
          br
          br
          br
        v-dialog.mt-12(
          v-model='transition2fourthDialog',
          hide-overlay,
          persistent,
          width='300'
        )
          v-card(
            flat,
            :color='colorTransition2fourth ? "primary" : "black"',
            style='transition-duration: 500ms; transition: 500ms ease-out',
            dark
          )
            v-card-text 
              h5.pt-4.mb-2(style='line-height: 85%') Производится оплата...
              v-progress-linear(indeterminate, color='white')
        v-stepper-step(color='green', step='4', :complete='stepper === 4', complete-icon='check') {{ $t("stepper.h4") }}
          small {{ $t("stepper.d4") }}
        v-stepper-content.pr-0(step='4', :style="stepper === 4 ? 'margin: 0' : ''")
          v-card.mb-12.pb-12.pa-md-8.pa-xs-2.pt-4.pb-2(flat, height='200px')
            h3.h Номер заказа
            v-otp-input(
              length='6',
              type='number',
              v-model='otp',
              readonly,
              style='max-width: 260px'
            )
            h5.t.pt-2(v-if='isBooking') Ждем вас к {{ time }}. Время считается с момента приезда
            h5.t.pt-2(v-else) Время стоянки успешно продлено до {{ newTime }}
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
import { randomInt } from 'crypto'

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

  slider_price = 420
  display_price = 420
  slider_time = 3
  time = '12:20'
  maxSteps = 12
  interval: any = false
  isTimePicker = false
  form = false
  attrs = {
    class: 'pa-0',
    boilerplate: false,
    elevation: 0,
  }

  nameRules = [(v) => !!v || 'Обязательное поле']
  emailRules = [
    (v) => !!v || 'Обязательное поле',
    (v) => /.+@.+/.test(v) || 'E-mail введен некорректно',
  ]

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
  transition2secondTimeDialog = false
  transition2fourthDialog = false
  colorTransition2fourth = false
  otp = '123456'
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

  rawMarkers = [
    { lat: 59.917173, lng: 30.349131, label: 'Тюшина, 9/7' },
    { lat: 59.9132451, lng: 30.2810058, label: 'Рижский, 46' },
    { lat: 59.9223964, lng: 30.3053673, label: 'Большая Подьяческая, 24/63' },
    {
      lat: 59.9697757,
      lng: 30.3849397,
      label: 'Кондратьевский проспект, 40 к10',
    },
    { lat: 59.8534572, lng: 30.2442293, label: 'Стачек проспект, 172' },
  ]
  markers = [
    {
      position: { lat: 59.917173, lng: 30.349131 },
      infoText: `<button class='h' onclick="window.open()">Тюшина, 9/7</button><br/><h6>Нажмите на адрес, чтобы построить маршрут</h6>`,
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
    this.transition2secondDialog = isBooking
    this.transition2secondTimeDialog = !isBooking
    if (!isBooking) {
      this.transition2secondDialog = false
      this.transition2secondTimeDialog = false
      this.stepper = 2
      this.isInfoWindowOpened = false
      this.otp = ''
      setTimeout(() => (this.$refs.otp as any).$refs.input[0].focus())
      // document.getElementById("#otp").focus()
      return
    }

    let date = new Date()
    this.time =
      (date.getHours().toString().length === 1
        ? '0' + date.getHours()
        : date.getHours().toString()) +
      ':' +
      (date.getMinutes().toString().length === 1
        ? '0' + date.getMinutes()
        : date.getMinutes().toString())
    setTimeout(() => {
      this.transition2secondDialog = false
      this.transition2secondTimeDialog = false
      this.stepper = 2
      this.isInfoWindowOpened = false
    }, 1500)
  }

  RandomNumString() {
    let result = ''
    for (let i = 0; i < 6; i++)
      result += Math.floor(Math.random() * 10).toString()
    return result
  }

  transition2third() {
    this.stepper = 3
    if (this.isBooking) setTimeout(() => (this.$refs.name as any).$refs.input.focus())
  }

  transition2fourth() {
    this.transition2fourthDialog = true
    this.otp = this.RandomNumString()
    setTimeout(() => {
      this.colorTransition2fourth = true
      setTimeout(() => {
        this.transition2fourthDialog = false
        this.stepper = 4
      }, 750)
    }, 750)
  }

  SliderChange() {
    this.slider_price = this.slider_time * 140 // price per hour
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
    interface Marker {
      position: {
        lat: number
        lng: number
      }
      infoText: string
    }
    let markers: Marker[] = []
    let isiPhone = /iPad|iPhone|iPod/.test(navigator.platform)
    let isAndroid =
      /Android|Linux armv5tej|Linux armv6l|Linux armv7l|Linux armv8l/.test(
        navigator.platform
      )
    this.rawMarkers.forEach((marker) => {
      let geocoords = marker.lat.toString() + ',' + marker.lng.toString()
      let infoText = ''
      if (isiPhone) {
        ;(infoText = 'maps://?q=' + geocoords), '_system'
      } else if (isAndroid) {
        let label = encodeURI(marker.label) // encode the label!
        infoText = 'geo:0,0?q=' + geocoords + '(' + label + ')'
        // window.open(content, '_system')
      } else infoText = 'https://www.google.co.in/maps?q=' + geocoords
      markers.push({
        position: { lat: marker.lat, lng: marker.lng },
        infoText:
          `<button class='h' onclick="window.open(\'` +
          infoText +
          `\')">` +
          marker.label +
          `</button><br/><h6>Нажмите на адрес, чтобы построить маршрут</h6>`,
      })
    })
    this.markers = markers
  }
}
</script>

<style>
.h {
  font-family: 'Gilroy', 'WebFont' !important;
  font-weight: 600;
  color: #00349b !important;
}
.v-stepper__label {
  font-family: 'Gilroy', 'WebFont' !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9) !important;
  line-height: 90% !important;
}
.t, small, small.t {
  font-family: 'Gilroy' !important;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9) !important;
  line-height: 90% !important;
}
span.t > span {
  font-weight: 600;
}

p {
  font-family: 'Gilroy' !important;
  font-weight: 500;
  opacity: 0.9 !important;
}

button > .v-btn__content {
  font-family: 'Gilroy' !important;
  font-weight: 500;
  opacity: 0.9 !important;
}

button.v-btn--loading > .v-btn__content {
  font-family: 'Gilroy' !important;
  font-weight: 500;
  opacity: 0 !important;
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
#pay {
  transition: cubic-bezier(0.165, 0.84, 0.44, 1);
  transition-duration: 500ms;
}
.v-skeleton-loader__actions.v-skeleton-loader__bone {
  padding: 0 !important
}
#stepper1 > .v-stepper__wrapper {
  padding: 16px 0px 0px 0px !important;
}
</style>