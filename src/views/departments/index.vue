<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <el-card class="tree-card">
        <!-- 头部 -->
        <tree-tools :tree-node="company" :is-root="true" />
        <!-- 主体 -->
        <el-tree :data="departs" :props="defaultProps" :default-expand-all="true" :expand-on-click-node="false">
          <tree-tools slot-scope="{data}" :tree-node="data" @addDepts="addDepts" @editDepts="editDepts" @delDepts="getDepartement" />
        </el-tree>
      </el-card>
    </div>
    <!-- dialog框 -->
    <add-dept ref="addDept" :show-dialog="showDialog" :tree-node="node" @addDepts="getDepartement" :showDialog.sync="showDialog" />
  </div>

</template>

<script>
import treeTools from './components/tree-tools.vue'
import addDept from './components/add-dept.vue'

import { getDepartement } from '@/api/departments'
import { transListToTreeData } from '@/utils'
export default {
  components: { treeTools, addDept },
  name: 'Departments',
  data() {
    return {
      company: {},
      departs: [],
      defaultProps: {
        label: 'name',
      },
      showDialog: false,
      node: null, //存储当前操作的节点
      loading: false,
    }
  },
  created() {
    this.getDepartement()
  },
  methods: {
    async getDepartement() {
      this.loading = true
      const result = await getDepartement()
      console.log(result)
      this.company = { name: result.companyName, manager: '负责人', id: '' } //id用于节点id与根节点遍历时对比，因为根节点的pid为''
      this.departs = transListToTreeData(result.depts, '')
      this.loading = false
    },
    addDepts(node) {
      this.showDialog = true
      // node为当前点击的部门
      this.node = node
    },
    editDepts(node) {
      this.showDialog = true
      this.node = node
      this.$refs.addDept.getDepartDetail(node.id)
    },
  },
}
</script>

<style lang='scss' scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>