import store from '@/store'
import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui'
import { getTimeStamp } from '@/utils/auth'

const Timeout = 3600 //定义时间戳超时时间

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000 //5秒
})

service.interceptors.request.use(config => {
  if (store.getters.token) {
    // 登录
    if (IsCheckTimeOut()) {
      // 超时
      store.dispatch('user/logout')
      router.push('/login')
      // 因为在Promise成功回调里，所以要跳出需要抛出一个错误
      return Promise.reject(new Error('token超时了'))
    }
    // 没超时则请求头携带token
    config.headers['Authorization'] = `Bearer ${store.getters.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  const { success, message, data } = response.data
  if (success) {
    return data
  } else {
    Message.error(message)
    // 因为没有错误，所以要new一个错误
    return Promise.reject(new Error(message))
  }
}, error => {
  // 后端token失效被动介入
  // if (error.response && error.response.data && error.response.data.code === 10002)
  if (error.response?.data?.code === 10002) {
    store.dispatch('user/logout')
    router.push('/login')
  }

  Message.error(error.message)
  return Promise.reject(error)
})

// 检查时间戳函数
function IsCheckTimeOut() {
  var currentTime = Date.now()
  var timestamp = getTimeStamp()
  return (currentTime - timestamp) / 1000 > Timeout
}

export default service