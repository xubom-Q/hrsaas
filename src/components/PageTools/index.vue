<template>
  <el-card class="page-tools">
    <el-row type="flex" justify="space-between" align="middle">
      <el-col>
        <div class="before">
          <i class="el-icon-info" v-if="showBefore" />
          <slot name="before" />
        </div>
      </el-col>
      <el-col>
        <el-row class="after" type="flex" justify="end">
          <slot name="after" />
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  name: 'PageTools',
  props: {
    showBefore: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang='scss' scoped>
.pageTools {
  margin: 10px 0;
  .before {
    line-height: 34;
  }
  i {
    margin-right: 5px;
    color: #409eff;
  }
  display: inline-block;
  padding: 0 10px;
  border-radius: 3px;
  border: 1px solid rgba(145, 213, 255, 1);
  background: rgba(230, 247, 255, 1);
}
</style>