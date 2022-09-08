import request from '@/utils/request'

// 登录接口
export function login(data) {
  return request({
    url: '/sys/login',
    method: 'post',
    data
  })
}
export function getUserInfo() {
  return request({
    url: '/sys/profile',
    method: 'post',
  })
}
// 获取某个员工的基本信息
export function $getUserDetailById(id) {
  return request({
    url: `/sys/user/${id}`,
  })
}