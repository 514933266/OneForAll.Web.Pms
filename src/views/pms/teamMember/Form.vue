<template>
  <el-container class="container">
    <el-header class="header">
      <el-row type="flex" justify="space-between">
      <el-page-header @back="goBack" :content="isAdd ? '新团队成员' : '编辑团队成员'" size="mini"></el-page-header>
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
      </el-row>
    </el-header>
    <el-main class="content">
      <el-form status-icon :disabled="disabled" :rules="validationRules" :model="entity" ref="form" size="mini"
        label-width="120px">
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" placeholder="请输入团队成员名称"></el-input>
        </el-form-item>
        <el-form-item label="岗位" prop="Job">
          <el-select allow-create filterable v-model="entity.Job" placeholder="请选择成员岗位">
            <el-option v-for="item in jobs" :key="item.value" :label="item.label" :value="item.label">
              <label>{{item.label}}</label>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import API from '../../../apis/pms-api'
import { MEMBER, MEMBER_FORM } from '../../../router/pms-router'

export default {
  name: MEMBER_FORM.name,
  data () {
    return {
      disabled: true, // 禁止编辑
      entity: {}, // 表单实体
      jobs: [
        { value: '设计', label: '设计' },
        { value: '前端开发', label: '前端开发' },
        { value: '后台开发', label: '后台开发' },
        { value: '测试', label: '测试' },
        { value: '需求', label: '需求' }
      ],
      validationRules: {
        Job: [{ required: true, message: '请先选择用户所属岗位' }, { min: 2, max: 20, message: '长度在2到20个字符' }],
        Name: [{ required: true, message: '请先填写团队成员名称' }, { min: 2, max: 20, message: '长度在2到20个字符' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  beforeRouteUpdate (to, from, next) {
    next(this.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.disabled = true
        this.entity = this.$route.params.entity
        this.isAdd = this.$route.params.isAdd
        if (this.isAdd) {
          this.disabled = false
        }
        this.loading = false
        this.$nextTick(() => { this.$refs.form.clearValidate() })
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
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$root.navigate({ ...MEMBER, params: {} })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background: #fff;

  .el-row {
    flex: 1;
    align-items: center;
  }
}
.content {
  margin-top: 20px;
  background: #fff;
  padding: 20px 0;

  /deep/.el-form {

    .el-select,
    .el-cascader,
    .el-input {
      width: 300px;
    }

    .el-switch {
      margin-right: 20px;
    }
  }
}
</style>
