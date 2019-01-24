import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import VueRouter from 'vue-router'

import Welcome from './components/Welcome'
import Project from './components/Project'

Vue.use(new VueSocketIO({
  debug: false,
  connection: 'http://localhost:3000/',
}))

Vue.config.productionTip = false

Vue.use(VueRouter)
const router = new VueRouter({
  routes : [
    {path: '/welcome', component: Welcome, alias: '/'},
    {path: '/project/:link', props: true, component: Project}
  ]
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
