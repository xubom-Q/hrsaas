<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共{{total}}条记录</span>
        <template slot="after">
          <el-button size="small" type="warning" @click="$router.push('/import?type=user')">导入</el-button>
          <el-button size="small" type="danger" @click="exportData">普通excel导出</el-button>
          <el-button size="small" type="danger" @click="exportMutiData">复杂表头excel导出</el-button>
          <el-button size="small" type="primary" @click="showDialog=true">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 放置表格和分页 -->
      <el-card>
        <el-table border :data="EmployeeList">
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column label="姓名" sortable="" prop="username" />
          <el-table-column label="工号" sortable="" prop="workNumber" />
          <el-table-column label="聘用形式" sortable="" prop="formOfEmployment" :formatter="formatEmployment" />
          <el-table-column label="部门" sortable="" prop="departmentName" />
          <el-table-column label="入职时间" sortable="" prop="timeOfEntry">
            <template slot-scope="scope">
              {{scope.row.timeOfEntry | formatDate}}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" sortable="" prop="enableState" />
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button type="text" size="small" @click="delEmployee(row.id)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination layout="prev, pager, next" :page-size="params.size" :current-page="params.page" :total="total" @current-change="changePage" />
        </el-row>
      </el-card>
    </div>
    <!-- 新增组件 -->
    <add-emp :show-dialog.sync="showDialog" />
    <!-- 分配角色组件 -->
    <assign-role ref="assignRole" :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import addEmp from '@/views/employees/components/add-emp.vue'
import { $getEmployeeList, $delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import { formatDate } from '@/filters'
import assignRole from './components/assign-role.vue'
export default {
  name: 'Employees',
  components: {
    addEmp,
    assignRole,
  },
  data() {
    return {
      loading: false,
      params: {
        page: 1,
        size: 10,
      },
      EmployeeList: [],
      total: 0,
      showDialog: false,
      userId: '',
      showRoleDialog: false,
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      const { rows, total } = await $getEmployeeList(this.params)
      this.EmployeeList = rows
      this.total = total
    },
    // 分页刷新
    changePage(newPage) {
      this.params.page = newPage
      this.getEmployeeList()
    },
    // 从枚举的文件中查找
    formatEmployment(row, column, cellValue, index) {
      const obj = EmployeeEnum.hireType.find((item) => {
        return item.id === cellValue
      })
      return obj ? obj.value : '未知'
    },
    // 分配角色
    async editRole(id) {
      this.userId = id // props传值 是异步的
      await this.$refs.assignRole.getUserDetailById(id) // 父组件调用子组件方法
      this.showRoleDialog = true
    },
    // 删除员工
    async delEmployee(id) {
      try {
        await this.$confirm('确定删除员工吗？')
        await $delEmployee(id)
        this.getEmployeeList()
        this.$message.success('删除员工成功')
      } catch (error) {
        console.log(error)
      }
    },
    // 导出数据
    exportData() {
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName',
      }
      // 懒加载
      import('@/vendor/Export2Excel').then(async (excel) => {
        const { rows } = await $getEmployeeList({ page: 1, size: this.total })
        // 对数据进行处理  数据格式[{},{}] => [[],[]]
        excel.export_json_to_excel({
          filename: '人力资源表',
          header: Object.keys(headers),
          data: this.formatJSON(headers, rows),
        })
      })
    },
    // 复杂表头导出
    exportMutiData() {
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName',
      }
      import('@/vendor/Export2Excel').then(async (excel) => {
        const { rows } = await $getEmployeeList({ page: 1, size: this.total })
        const data = this.formatJSON(headers, rows)
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2']
        excel.export_json_to_excel({
          filename: '人力资源表（复杂表头）',
          header: Object.keys(headers),
          data,
          multiHeader,
          merges,
        })
      })
    },
    formatJSON(headers, rows) {
      return rows.map((item) => {
        return Object.keys(headers).map((key) => {
          if (headers[key] === 'titimeOfEntryme' || headers[key] === 'correctionTime') {
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find((o) => {
              return o.id === item[headers[key]]
            })
            return obj ? obj.value : '未知'
          }
          // headers[key]为每一个具体的值
          return item[headers[key]]
        })
      })
    },
  },
}
</script>

<style lang='scss' scoped>
</style>
