import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Timeline from './components/Timeline.vue'
// import TechniquesChart from './components/TechniquesChart.vue'
import HelloWorld from './components/HelloWorld.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')

const routes = [
  { path: '/', component: Timeline },
  { path: '/hello', component: HelloWorld }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})