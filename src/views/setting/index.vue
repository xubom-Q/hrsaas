<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card class="box-card">
        <el-tabs value="roleManager">
          <el-tab-pane label="角色管理" name="roleManager">
            <el-row style="height:60px">
              <el-button type="primary" @click="showDialog=true">新增角色</el-button>
            </el-row>
            <!-- 表格 -->
            <el-table :data="roleList" style="width: 100% ;">
              <el-table-column type="index" label="序号">
              </el-table-column>
              <el-table-column prop="name" label="角色名">
              </el-table-column>
              <el-table-column prop="description" label="描述">
              </el-table-column>
              <el-table-column prop="address" label="操作">
                <template v-slot="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>

              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-row type="flex" justify="center" align="middle" style="margin-top: 40px">
              <el-pagination :current-page="params.page" :page-size="params.pageize" layout="prev, pager, next" :total="total" @current-change="changepage">
              </el-pagination>
            </el-row>

          </el-tab-pane>
          <el-tab-pane label="公司信息" name="companyInfo">
            <el-alert title="消息提示的文案" type="info" show-icon :closable="false">
            </el-alert>
            <el-form ref="form" :model="companyInfo" label-width="120px" style="margin-top:50px">
              <el-form-item label="企业名称">
                <el-input v-model="companyInfo.name" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="companyInfo.companyAddress" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="公司电话">
                <el-input v-model="companyInfo.companyPhone" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="companyInfo.mailbox" disabled style="width:400px"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="companyInfo.remarks" type="textarea" :rows="3" disabled style="width:400px"></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 新增编辑角色弹窗 -->
    <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="3">
          <el-button size="small" @click="btnCancel">取 消</el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" size="small" @click="btnOk">确 定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 分配权限弹窗 -->
    <el-dialog title="分配权限" :visible="showPermDialog" @close="btnPermCancel">
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
      <!-- id作为唯一标识 -->
      <el-tree ref="permTree" :data="permData" :props="defaultProps" :show-checkbox="true" :check-strictly="true" :default-expand-all="true" :default-checked-keys="selectCheck" node-key="id" />
      <!-- 确定 取消 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOK">确定</el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { $getPermissionList } from '@/api/permission'
import {
  getRoleList,
  getCompanyInfo,
  delRole,
  getRoleDetail,
  updateRole,
  addRole,
  $assignPerm,
} from '@/api/setting'
import { transListToTreeData } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'Setting',
  data() {
    return {
      params: {
        page: 1,
        pagesize: 10,
      },
      total: 0,
      roleList: [],
      companyInfo: {},
      // 编辑弹层数据
      showDialog: false,
      roleForm: {}, //新增编辑的表单数据
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
      },
      showPermDialog: false,
      defaultProps: {
        label: 'name',
      },
      permData: [], // 专门用来接收权限数据 树形数据
      selectCheck: [], // 定义一个数组来接收 已经选中的节点
      roleId: null, // 用来记录分配角色的id
    }
  },
  computed: {
    ...mapGetters(['companyId']),
    showTitle() {
      return this.roleForm.id ? '编辑角色' : '新增角色'
    },
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    // 角色列表
    async getRoleList() {
      const { rows, total } = await getRoleList(this.params)
      this.total = total
      this.roleList = rows
    },
    // 编辑角色
    async editRole(id) {
      this.roleForm = await getRoleDetail(id)
      this.showDialog = true
    },
    // 删除角色
    async deleteRole(id) {
      try {
        await this.$confirm('确定删除该角色吗')
        await delRole(id)
        this.getRoleList()
        this.$message.success('删除角色成功')
      } catch (error) {
        console.log(error)
      }
    },
    // 弹层确定按钮
    async btnOk() {
      try {
        await this.$refs.roleForm.validate()
        if (this.roleForm.id) {
          // 编辑
          await updateRole(this.roleForm)
        } else {
          // 新增
          await addRole(this.roleForm)
        }
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false
      } catch (error) {
        console.log(error)
      }
    },
    btnCancel() {
      this.roleForm = {}
      this.$refs.roleForm.resetFields()
      this.showDialog = false
    },

    // 公司信息
    async getCompanyInfo() {
      this.companyInfo = await getCompanyInfo(this.companyId)
    },
    handleClick(e) {
      console.log(e)
    },
    changepage(page) {
      this.params.page = page
      this.getRoleList()
    },
    // 点击分配权限按钮
    async assignPerm(id) {
      //获取权限点并转化为树形数据
      this.permData = transListToTreeData(await $getPermissionList(), '0')
      // 需要分配权限的角色id
      this.roleId = id
      const { permIds } = await getRoleDetail(id)
      this.selectCheck = permIds
      this.showPermDialog = true
    },
    async btnPermOK() {
      // 调用el-tree的方法
      // console.log(this.$refs.permTree.getCheckedKeys())
      await $assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.selectCheck = [] // 重置数据
      this.showPermDialog = false
    },
  },
}
</script>

<style lang='scss' scoped>
</style>
