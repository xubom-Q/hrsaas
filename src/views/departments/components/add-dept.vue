<template>
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <el-form ref="deptForm" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeesSimple">
          <el-option v-for="item in peoples" :key="item.id" :label="item.username" :value="item.username" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-50个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="4">
        <el-button size="small" @click="btnCancel">取 消</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" size="small" @click="btnOk">确 定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {
  getDepartement,
  addDepartements,
  getDepartDetail,
  updateDepartDetail,
} from '@/api/departments'
import { getEmployeesSimple } from '@/api/employees'
export default {
  name: 'addDept',
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    treeNode: {
      type: Object,
      default: null,
    },
  },
  data() {
    //名称校验规则
    const checkNameRepeat = async (rule, value, callback) => {
      console.log(callback)
      //获取最新的结构，对其过滤出重复的
      const { depts } = await getDepartement()
      let isRepeat = false
      if (this.formData.id) {
        // 编辑
        // 除了我之外，统计部门下不能有叫张三
        isRepeat = depts
          .filter((item) => item.id !== this.treeNode.id && item.pid !== this.treeNode.pid)
          .some((item) => item.name === value)
      } else {
        // 新增
        isRepeat = depts
          .filter((item) => item.pid === this.treeNode.id)
          .some((item) => item.name === value)
      }
      isRepeat ? callback(new Error(`同级部门下已经有${value}的部门了`)) : callback()
    }
    //编码校验规则
    const checkCodeRepeat = async (rule, value, callback) => {
      const { depts } = await getDepartement()
      if (this.formData.id) {
        const isRepeat = depts.some(
          (item) => item.code !== this.formData.id && item.code === value && value
        ) //value 可能为空
      } else {
        const isRepeat = depts.some((item) => item.code === value && value) //value 可能为空
      }

      isRepeat ? callback(new Error(`架构中已经有部门使用${value}了`)) : callback()
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '', // 部门介绍
      },
      rules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门名称为1-50个字符',
            trigger: 'blur',
          },
          {
            // 同级部门不能出现重复的部门名称
            trigger: 'blur',
            validator: checkNameRepeat,
          },
        ], // 部门名称
        code: [
          { required: true, message: '部门编码不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门编码为1-50个字符',
            trigger: 'blur',
          },
          {
            trigger: 'blur',
            validator: checkCodeRepeat,
          },
        ], // 部门编码
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }], // 部门管理者
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 300,
            message: '部门介绍为1-300个字符',
            trigger: 'blur',
          },
        ], // 部门介绍
      },
      peoples: [],
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增部门'
    },
  },
  methods: {
    async getEmployeesSimple() {
      this.peoples = await getEmployeesSimple()
    },
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id)
    },
    btnOk() {
      this.$refs.deptForm.validate(async (isOk) => {
        if (isOk) {
          if (this.formData.id) {
            // 编辑模式
            await updateDepartDetail(this.formData)
          } else {
            // 新增模式 可以提交了      添加父部门的id
            await addDepartements({ ...this.deptForm, pid: this.treeNode.id })
          }

          this.$emit('addDepts')
          this.$emit('update:showDialog', false)
        }
      })
    },
    btnCancel() {
      // 因为resetFields只能重置表单的数据，其他的不能重置
      ;(this.formData = {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '', // 部门介绍
      }),
        this.$refs.deptForm.resetFields()
      this.$emit('update:showDialog', false)
    },
  },
}
</script>

<style lang='scss' scoped>
</style>