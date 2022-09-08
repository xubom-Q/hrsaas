import Layout from '@/layout'

export default {
  path: '/employees',
  name: 'employees',
  component: Layout,
  children: [{
    path: '',
    component: () => import('@/views/employees'),
    meta: {
      title: '员工管理'
    }
  }, {
    path: 'detail/:id', // 动态路由参数 /:id id必须填  不填跳不过去 /:id? ?表示id可填可不填
    component: () => import('@/views/employees/detail'),
    hidden: true, // 在左侧菜单隐藏
    meta: {
      title: '员工详情'
    }
  }]

}