import { login, getUserInfo, $getUserDetailById } from "@/api/user"
import { getToken, setToken, removeToken, setTimeStamp } from "@/utils/auth"
import { remove } from "nprogress"
//token持久化  实现？ vuex和前端缓存相结合
// 初始化的时候从缓存中读取状态，并赋值到初始化的状态上
export default {
  namespaced: true,
  state: {
    token: getToken(),
    userInfo: {}  //getters中如果引用的是null，会引起异常和报错
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      // 缓存的数据也需变化  同步
      setToken(token)
    },
    removeToken(state) {
      state.token = null
      removeToken()
    },
    setUserInfo(state, userInfo) {
      state.userInfo = { ...userInfo }
    },
    removeUserInfo(state) {
      state.userInfo = {}
    }
  },

  actions: {
    async login(context, data) {
      // 请求拦截已做处理，只有请求成功才返回data
      const result = await login(data)
      context.commit('setToken', result)
      setTimeStamp()
    },
    async getUserInfo(context) {
      const result = await getUserInfo()
      const baseInfo = await $getUserDetailById(result.userId)
      const baseResult = { ...result, ...baseInfo }
      context.commit('setUserInfo', baseResult)
      return baseResult
    },
    logout(context) {
      context.commit('removeToken')
      context.commit('removeUserInfo')
      resetRouter()
      context.commit('permission/setRoutes', [], { root: true })//root表示父模块
    }
  }
}
