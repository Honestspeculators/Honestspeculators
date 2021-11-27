<template lang="pug">
v-app()
  //- Navbar
  v-main
    router-view
    v-footer.pt-4.pb-4(style="margin-top: 18vh")
      v-layout(align-center, justify-center, style="color: #333;")
        h6.pr-1 Made with 
        h6.pr-1(style="color: red")  ❤
        h6 by 
        h6
          a.pl-1(href="https://kniazevgeny.github.io") kniazevgeny
</template>

<script lang="ts">
import Vue from 'vue'
import { i18n } from '@/plugins/i18n'
import Component from 'vue-class-component'
import { namespace } from 'vuex-class'


@Component({ })
export default class App extends Vue {

  created() {
    document.title = i18n.t('title') as string
  }

  get metaInfo() {
    return {
      title: i18n.t('title') as string,
    }
  }
}
</script>
<style>
h6 {
  font-weight: 600;
  color: gray;
}
h6 > a, a:active, a:link {
  color: gray !important;
  text-decoration-color: gray;
}
</style>