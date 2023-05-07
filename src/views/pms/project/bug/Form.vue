<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header">
      <el-page-header @back="goBack" :content="isAdd ? '新建项目Bug' : '编辑Bug'" size="mini"></el-page-header>
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
      <el-card content-position="left">
        <el-form status-icon :model="entity" :rules="validationRules" :disabled="disabled" ref="form" size="mini" label-width="120px">
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" placeholder="请输入Bug标题"></el-input>
          </el-form-item>
          <el-form-item label="指派给" prop="UserId">
            <el-select v-model="entity.UserId" placeholder="请选择指派人员">
              <el-option v-for="item in members" :key="item.Id" :label="item.Name" :value="item.UserId">
                {{item.Name}}&nbsp;({{item.Job}})
              </el-option>
            </el-select>
          </el-form-item>
          <div class="row">
            <el-form-item label="紧急程度" prop="Level">
              <el-select v-model="entity.Level">
                <el-option :value="0" label="轻微"></el-option>
                <el-option :value="1" label="中等"></el-option>
                <el-option :value="2" label="严重"></el-option>
                <el-option :value="3" label="致命"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Bug类型" prop="Type">
              <el-select v-model="entity.Type">
                <el-option :value="0" label="代码错误"></el-option>
                <el-option :value="1" label="前端样式"></el-option>
                <el-option :value="2" label="设计缺陷"></el-option>
                <el-option :value="3" label="性能优化"></el-option>
                <el-option :value="4" label="安全相关"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="Status">
              <el-select v-model="entity.Status">
                <el-option :value="0" label="未解决"></el-option>
                <el-option :value="1" label="已解决"></el-option>
                <el-option :value="2" label="关闭"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="内容" prop="Content">
            <tinymce-editor v-if="!loading" v-model="entity.Content" @uploadImage="uploadImage" :maxImageSize="2097152"></tinymce-editor>
          </el-form-item>
          <el-form-item label="优先级" prop="Priority">
            <el-radio-group v-model="entity.Priority">
              <el-radio :label="0">
                <font-awesome-icon fas icon="unlock-alt"></font-awesome-icon>&nbsp;
                <span>级别一</span>
                <div class="tips">该项Bug不紧急也不重要，自由安排。</div>
              </el-radio>
              <el-radio :label="1">
                <font-awesome-icon fas icon="calendar-alt"></font-awesome-icon>&nbsp;
                <span>级别二</span>
                <div class="tips">该项Bug不紧急但比较重要，需要提前计划。</div>
              </el-radio>
              <el-radio :label="2">
                <font-awesome-icon fas icon="hourglass-half"></font-awesome-icon>&nbsp;
                <span>级别三</span>
                <div class="tips">该项Bug紧急但不太重要，需要立即安排。</div>
              </el-radio>
              <el-radio :label="3">
                <font-awesome-icon fas icon="exclamation-triangle"></font-awesome-icon>&nbsp;
                <span>级别四</span>
                <div class="tips">该项Bug紧急且严重，需要放弃其他工作优先完成。</div>
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import API from '../../../../apis/pms-api'
import { PROJECT_BUG_FORM, PROJECT_DETAIL } from '../../../../router/pms-router'
import { BUG_TYPE, BUG_LEVEL, BUG_STATUS } from '../../../../assets/js/pms-const'

// 项目Bug表单
export default {
  name: PROJECT_BUG_FORM.name,
  data () {
    return {
      types: BUG_TYPE, // 类型
      levels: BUG_LEVEL, // 严重程度
      status: BUG_STATUS, // 完成状态
      loading: false, // 数据加载中
      isUploaded: false, // 是否上传过图片
      disabled: true, // 允许编辑
      isAdd: false, // 表单是否添加模式
      members: [], // 成员列表
      entity: {}, // 当前对象
      validationRules: {
        Title: [{ required: true, message: '请先填写需求标题' }, { min: 2, max: 50, message: '长度在2到50个字符' }],
        Content: [{ required: true, message: '请先填写需求内容' }],
        UserId: [{ required: true, message: '请选择Bug指派对象' }],
        Type: [{ required: true, message: '请选择Bug类型' }],
        Status: [{ required: true, message: '请选择Bug状态' }],
        Level: [{ required: true, message: '请选择Bug紧急程度' }]
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
        this.entity = {
          Id: this.$store.state.guid,
          Priority: 0,
          Status: 0,
          ...this.$route.params
        }
        this.isAdd = this.$route.params.isAdd
        if (this.isAdd) {
          this.disabled = false
        }
        this.getMembers()
        this.$nextTick(() => { this.$refs.form.clearValidate() })
      }
    },
    getMembers () {
      const url = this.$root.getApi(API.KEY, API.MEMBER.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.get(url).then(response => {
        this.members = response
        this.loading = false
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
      const url = this.$root.getApi(API.KEY, API.BUG.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.BUG.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    uploadImage (upload) {
      const formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      const url = this.$root.getApi(API.KEY, API.BUG.IMAGES.replace(/{id}/, this.entity.Id)) + `?projectId=${this.entity.ProjectId}`

      this.axios.post(`${url}`, formData)
        .then(response => {
          if (response.Status) {
            const imgUrl = this.$root.getApi(API.KEY, '/' + response.Data.Result.Url)
            upload.success(imgUrl)
          } else {
            upload.failure(response.Message)
          }
        }).catch(() => {
          upload.failure('上传失败')
        })
    },
    del () {
      const url = this.$root.getApi(API.KEY, API.BUG.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.delete(`${url}/${this.entity.Id}`)
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

  .quillWrapper .ql-editor {
    height: 350px;
  }

  .el-image,
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    vertical-align: middle;
  }
}
</style>
