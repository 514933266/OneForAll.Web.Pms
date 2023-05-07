<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" :content="isAdd ? '新建项目里程碑' : '编辑里程碑'" size="mini"></el-page-header>
      <div class="button-box">
        <span v-if="disabled">
          <el-button round @click="disabled = false" type="primary" size="mini">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;编辑
          </el-button>
        </span>
        <span v-else>
          <el-button round @click="submit" type="primary" size="mini">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button round v-show="!isAdd" type="warning" size="mini" @click="disabled = true">
            <font-awesome-icon fas icon="reply"></font-awesome-icon>&nbsp;取消
          </el-button>
        </span>
      </div>
    </el-card>
    <div class="form-content">
      <el-card content-position="left" shadow="never">
        <el-form status-icon :model="entity" :rules="validationRules" :disabled="disabled" ref="form" size="mini" label-width="120px">
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" placeholder="请输入里程碑标题"></el-input>
          </el-form-item>
          <el-form-item label="起止时间" prop="BeginTime">
            <el-date-picker v-model="dates" @change="selectDate" value-format="yyyy-MM-dd" type="daterange"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="状态" prop="Status">
            <el-select v-model="entity.Status">
              <el-option :value="0" label="未达成">未达成</el-option>
              <el-option :value="1" label="已达成">已达成</el-option>
              <el-option :value="2" label="已关闭">已关闭</el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import API from '../../../../apis/pms-api'
import { PROJECT_DETAIL, PROJECT_MILESTONE_FORM } from '../../../../router/pms-router'

// 项目里程碑
export default {
  name: PROJECT_MILESTONE_FORM.name,
  data () {
    return {
      dates: [], // 起止时间
      entity: {},
      disabled: true, // 允许编辑
      isAdd: false, // 表单是否添加模式
      validationRules: {
        BeginTime: [{ required: true, message: '请选择起止时间', trigger: 'trigger' }],
        Status: [{ required: true, message: '请选择状态', trigger: 'trigger' }],
        Title: [{ required: true, message: '请先填写里程碑标题' }, { min: 2, max: 50, message: '长度在2到50个字符' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.dates = []
      this.entity = {
        Id: this.$store.state.guid,
        Status: 0,
        ...this.$route.params
      }
      this.isAdd = this.$route.params.isAdd
      if (this.isAdd) {
        this.disabled = false
      }
      if (!this.isAdd) {
        this.dates = [this.entity.BeginTime, this.entity.EndTime]
      }
      this.$nextTick(() => { this.$refs.form.clearValidate() })
    },
    selectDate (values) {
      this.entity = { ...this.entity, dates: values }
      if (values) {
        this.entity.BeginTime = values[0]
        this.entity.EndTime = values[1]
      }
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.MILESTONE.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.MILESTONE.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$root.navigate({ ...PROJECT_DETAIL })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.el-form {

  .el-date-editor,
  .el-select,
  .el-input,
  input {
    width: 100%;
  }

  /deep/ .el-select {
    .el-input,
    input {
      width: 100%;
    }
  }
}
</style>
