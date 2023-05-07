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
          <el-form-item label="里程碑" prop="MilestoneId">
            <el-select v-model="entity.MilestoneId">
              <el-option v-for="item in milestones" :value="item.Id" :label="item.Title" :key="item.Id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="Status">
            <el-select v-model="entity.Status">
              <el-option :value="0" label="未解决">未解决</el-option>
              <el-option :value="1" label="已解决">已解决</el-option>
              <el-option :value="2" label="已关闭">已关闭</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" placeholder="请输入风险标题"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="Remark">
            <el-input show-word-limit v-model="entity.Remark" :row="5" type="textarea" maxlength="300"
              placeholder="请输入备注">
            </el-input>
          </el-form-item>
          <el-form-item label="严重等级" prop="Priority">
            <el-radio-group v-model="entity.Priority">
              <el-radio :label="0">
                <font-awesome-icon fas icon="unlock-alt"></font-awesome-icon>&nbsp;
                <span>级别一</span>
                <div class="tips">该项风险影响轻微，可忽略。</div>
              </el-radio>
              <el-radio :label="1">
                <font-awesome-icon fas icon="calendar-alt"></font-awesome-icon>&nbsp;
                <span>级别二</span>
                <div class="tips">该项风险会影响项目质量。</div>
              </el-radio>
              <el-radio :label="2">
                <font-awesome-icon fas icon="hourglass-half"></font-awesome-icon>&nbsp;
                <span>级别三</span>
                <div class="tips">该项风险会影响项目进度。</div>
              </el-radio>
              <el-radio :label="3">
                <font-awesome-icon fas icon="exclamation-triangle"></font-awesome-icon>&nbsp;
                <span>级别四</span>
                <div class="tips">该项风险会导致项目无法开展。</div>
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { PROJECT_DETAIL, PROJECT_RISK_FORM } from '../../../../router/pms-router'
import API from '../../../../apis/pms-api'

// 项目风险
export default {
  name: PROJECT_RISK_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      disabled: true, // 允许编辑
      isAdd: false, // 表单是否添加模式
      dates: [], // 起止时间
      entity: {}, // 实体
      milestones: [], // 里程碑
      validationRules: {
        MilestoneId: [{ required: true, message: '请选择所属里程碑' }],
        BeginTime: [{ required: true, message: '请选择起止时间' }],
        Status: [{ required: true, message: '请选择状态' }],
        Priority: [{ required: true, message: '请选择风险等级' }],
        Title: [{ required: true, message: '请先填写风险标题' }, { min: 2, max: 50, message: '长度在2到50个字符' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.getMilestones()
      this.dates = []
      this.entity = {
        Status: 0,
        Priority: 0,
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
    getMilestones () {
      const url = this.$root.getApi(API.KEY, API.MILESTONE.URL)
      this.axios.get(url, {
        params: {
          projectId: this.entity.ProjectId
        }
      }).then(response => {
        this.milestones = response
      })
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
      const url = this.$root.getApi(API.KEY, API.RISK.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.RISK.URL) + `?projectId=${this.entity.ProjectId}`
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
  margin-top: 30px;

  .el-radio-group {
    label {
      display: block;
    }

    .tips {
      padding: .875rem;
      color: #99a9bf;
    }
  }

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
