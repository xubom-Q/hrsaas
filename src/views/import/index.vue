<template>
  <!-- 公共导入组件 -->
  <upload-excel :on-success="success" />
</template>

<script>
import { $importEmployee } from '@/api/employees'
export default {
  name: 'import',
  methods: {
    async success({ header, results }) {
      const userRelations = {
        入职日期: 'timeOfEntry',
        手机号: 'mobile',
        姓名: 'username',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName',
        聘用形式: 'formOfEmployment',
      }
      const arr = []
      // 中英文进行转换  数据格式[{},{}]
      results.forEach((item) => {
        const userInfo = {}
        // Object.keys获取到中文的数组
        Object.keys(item).forEach((key) => {
          if (userRelations[key] === 'timeOfEntry' || userRelations[key] === 'correctionTime') {
            // key是中文，userRelations[key]是英文
            // 将原来中文对应的值赋给原来英文对应的值
            userInfo[userRelations[key]] = new Date(this.formatDate(item[key], '/'))
          } else {
            userInfo[userRelations[key]] = item[key]
          }
        })
        arr.push(userInfo)
      })
      await $importEmployee(arr)
      this.$router.back()
      this.$message.success('导入成功')
    },
    // excel的时间格式需要转换
    formatDate(numb, format) {
      const time = new Date((numb - 1) * 24 * 3600000 + 1)
      time.setYear(time.getFullYear() - 70)
      const year = time.getFullYear() + ''
      const month = time.getMonth() + 1 + ''
      const date = time.getDate() - 1 + ''
      if (format && format.length === 1) {
        return year + format + month + format + date
      }
      return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
    },
  },
}
</script>

<style lang='scss' scoped>
</style>