import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { messages } from '@/assets/localization'

Vue.use(VueI18n)

function getNavigatorLanguage() {
  return 'ru'
}

export const i18n = new VueI18n({
  locale: getNavigatorLanguage(),
  fallbackLocale: 'en',
  messages,
})
