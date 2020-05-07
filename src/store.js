import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0,
    globalData: {
      comment: '赢贝',
      desc: '移动端商城'
    },
    defaultAddress: {},
    userInfo: {
      avatarUrl: '',
      nick: '',
      province: '',
      city: '',
      mobile: ''
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    updateDefaultAddress(state, address) {
      state.defaultAddress = address
      // console.log(state.defaultAddress)
    },
    updateUserInfo(state, userInfo) {
      state.userInfo = Object.assign(state.userInfo, userInfo)
    }
  }
})
export default store
