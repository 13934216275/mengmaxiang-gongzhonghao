import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
Vue.config.productionTip = false
import 'vant/lib/index.css'
import request from './common/request'
import './common/flexible'
// 引入 Vant 基础组件及弹窗
import { Button, Cell, CellGroup, Icon, Row, Col, Popup, Toast, Dialog, Area, Loading  } from 'vant'
import { Sidebar, SidebarItem } from 'vant'
import { TreeSelect } from 'vant'
import { Card } from 'vant'
import { Tab, Tabs, Grid, GridItem, Search  } from 'vant'
Vue.use(Grid).use(GridItem).use(Search)
Vue.use(Tab).use(Tabs)
Vue.use(Card)
Vue.use(Loading )
Vue.use(TreeSelect)
Vue.use(Sidebar)
Vue.use(SidebarItem)
Vue.use(Button).use(Cell).use(CellGroup).use(Icon).use(Row).use(Col).use(Popup).use(Area)
// 使用Image  会保install 错误,可能是测试版本的原因
// 在 Vue 的 prototype 上挂载 $toast 方法，便于在组件内调用(自动挂载,真机出现问题)
Vue.prototype.$toast = Toast
Vue.prototype.$dialog = Dialog
Vue.prototype.$request = request
router.beforeEach((to, from, next) => {
  // 统计代码
  window._hmt.push(['_trackPageview', to.fullPath])
  next()
})
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
