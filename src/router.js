import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}

export default new VueRouter({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),

  routes: [
    {
      path: '/',
      component: load('Index'),
      children: [
        {
          path: '/home',
          name: 'home',
          component: load('Home')
        },
        {
          path: '/signin',
          name: 'signin',
          component: load('SignIn')
        },
        {
          path: '/register',
          name: 'register',
          component: load('SignIn')
        },
        {
          path: '/times',
          name: 'times',
          component: load('Times')
        },
        {
          path: '/projects',
          name: 'projects',
          component: load('Projects')
        }
      ]
    },
    // Always leave this last one
    { path: '*', component: load('Error404') } // Not found
  ]
})
