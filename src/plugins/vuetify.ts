import Vue from 'vue'
import Vuetify, {
  VApp,
  VAppBar,
  VToolbarTitle,
  VSpacer,
  VBtn,
  VIcon,
  VMenu,
  VList,
  VListItem,
  VListItemTitle,
  VFlex,
  VLayout,
  VSnackbar,
  VTextField,
  VTextarea,
  VInput,
  VContainer,
  VStepper,
  VStepperStep,
  VStepperContent,
  VCard,
  VCardTitle,
  VCardText,
  VDialog,
  VProgressLinear,
  VSlider,
  VOtpInput,
  VFooter,
  VMain,
} from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  components: {
    VApp,
    VAppBar,
    VToolbarTitle,
    VSpacer,
    VBtn,
    VIcon,
    VMenu,
    VList,
    VListItem,
    VListItemTitle,
    VFlex,
    VLayout,
    VSnackbar,
    VTextField,
    VTextarea,
    VInput,
    VContainer,
    VStepper,
    VStepperStep,
    VStepperContent,
    VCard,
    VCardTitle,
    VCardText,
    VDialog,
    VProgressLinear,
    VSlider,
    VOtpInput,
    VFooter,
    VMain,
  },
})

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: '#00349B'
      }
    }
  }
})
