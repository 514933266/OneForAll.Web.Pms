<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" :content="isAdd ? '新建项目' : '编辑项目'" size="mini"></el-page-header>
      <div class="button-box">
        <span v-if="disabled">
          <el-button round @click="disabled = false" type="primary" size="mini">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;编辑
          </el-button>
        </span>
        <span v-else>
          <el-button round @click="submit" type="primary" size="mini">
            {{isAdd ? '确认创建' : '保存'}}
          </el-button>
          <el-button round v-show="!isAdd" type="warning" size="mini" @click="disabled = true">
            <font-awesome-icon fas icon="reply"></font-awesome-icon>&nbsp;取消
          </el-button>
        </span>
      </div>
    </el-card>
    <el-card class="form-content" content-position="left" shadow="never">
      <el-form status-icon :model="entity" :rules="validationRules" :disabled="disabled" ref="form" size="mini"
        label-width="120px">
        <el-form-item label="项目名称" prop="Name">
          <el-input v-model.trim="entity.Name" size="mini" placeholder="项目的名称，尽量不要相同"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="Remark">
          <el-input show-word-limit v-model="entity.Remark" :rows="5" type="textarea" maxlength="300" size="mini"
            placeholder="在这里写上项目的简单介绍...">
          </el-input>
        </el-form-item>
        <el-form-item label="可见等级" prop="Scope">
          <el-radio-group v-model="entity.Scope" size="mini">
            <el-radio :label="0">
              <font-awesome-icon fas icon="lock" size="lg"></font-awesome-icon>&nbsp;
              <span>Private</span>
              <div class="tips">项目必须明确授权给每个用户访问。</div>
            </el-radio>
            <el-radio :label="1">
              <font-awesome-icon fas icon="shield-alt" size="lg"></font-awesome-icon>&nbsp;
              <span>Internal</span>
              <div class="tips">项目可以被所有已登录用户查看。</div>
            </el-radio>
            <el-radio :label="2">
              <font-awesome-icon fas icon="globe" size="lg"></font-awesome-icon>&nbsp;
              <span>Public</span>
              <div class="tips">项目可以被任何用户查看。</div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div v-if="!isAdd" class="del-box">
        <div class="header">删除项目</div>
        <div>
          <div class="content">
            <p>删除项目将会删除所有相关需求、任务、任务分配情况、Bug、里程碑、风险等数据。 </p>
            <p><b>删除的项目无法恢复！</b></p>
          </div>
          <div class="box-footer">
            <el-button type="danger" size="mini" @click="del">
              <font-awesome-icon fas icon="trash"></font-awesome-icon>
              &nbsp;删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/pms-api'
import { PROJECT, PROJECT_FORM, PROJECT_DETAIL } from '../../../router/pms-router'

export default {
  name: PROJECT_FORM.name,
  data () {
    return {
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {}, // 表单实体
      validationRules: {
        Name: [{ required: true, message: '请先填写项目名称' }, { min: 2, max: 20, message: '长度在2到50个字符' }],
        Scope: [{ required: true, message: '请先选择项目可见等级' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.entity = { Scope: 0, ...this.$route.params }
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
      const url = this.$root.getApi(API.KEY, API.PROJECT.URL)
      this.axios.post(url, this.entity).then(response => {
        if (response.Status) {
          this.entity.Id = response.Data
          this.goBack()
        }
      })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.PROJECT.URL)
      this.axios.put(url, this.entity).then(response => {
        if (response.Status) this.goBack()
      })
    },
    del () {
      this.$prompt(`<h2 class='text-danger'>将要删除 ${this.entity.Name} , 删除后无法恢复！ 确定要继续么？</h2>
      <div>此动作会导致关联数据同步删除。 为防止有意外操作，请输入 <label class="text-danger"> ${this.entity.Name}</label> 继续操作或关闭本对话框取消操作。
      </div>`, '请确认操作', {
        customClass: 'pms-project-del-confirm',
        dangerouslyUseHTMLString: true,
        inputValidator: (value) => { return this.entity.Name === value },
        inputErrorMessage: '输入项目名称不正确，将无法删除',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const url = this.$root.getApi(API.KEY, API.PROJECT.URL)
        this.axios.delete(`${url}/${this.entity.Id}`).then(response => {
          if (response.Status) this.$root.navigate({ ...PROJECT, params: {} })
        })
      })
    },
    goBack () {
      if (this.entity.Id) {
        this.$root.navigate({ ...PROJECT_DETAIL, params: this.entity })
      } else {
        this.$root.navigate({ ...PROJECT })
      }
    }
  },
  created () {
    this.init(this.$route.params.entity)
  }
}
</script>

<style lang="scss" scoped>
.ofa-form {

  .el-input,
  input {
    width: 100%;
  }

  .el-radio-group {
    label {
      display: block;
    }

    .tips {
      padding: .75rem;
      color: #99a9bf;
    }
  }

  .del-box {
    margin-top: 25px;
    border: 1px solid #ebeef5;

    .header {
      padding: 20px;
      color: #fff;
      background-color: #f56c6c;
    }

    .content {
      padding: 20px;
    }

    .box-footer {
      padding: 20px;
    }
  }
}
</style>
