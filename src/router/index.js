import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/files'
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('../views/FilesView.vue')
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
