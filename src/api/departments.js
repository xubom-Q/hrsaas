import request from '@/utils/request'

export function getDepartement() {
  return request({
    url: '/company/department'
  })
}

export function getDepartDetail(id) {
  return request({
    url: `/company/department/${id}`
  })
}

export function updateDepartDetail(data) {
  return request({
    url: `/company/department/${data.id}`,
    method: 'put',
    data
  })
}

export function delDepartements(id) {
  return request({
    url: `/company/department/${id}`,
    method: 'delete'
  })
}

export function addDepartements(data) {
  return request({
    url: '/company/department',
    method: 'post',
    data
  })
}