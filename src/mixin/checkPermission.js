import store from '@/store'
export default {
  methods: {
    checkPermission(key) {
      const { userInfo } = store.state.user
      if (userInfo && userInfo.roles && userInfo.roles.points && userInfo.roles.points.length) {
        return userInfo.role.points.some(item => item === key)
      }
      return false
    }
  }
}