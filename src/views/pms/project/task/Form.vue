<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" :content="isAdd ? '新建项目任务' : '编辑任务'" size="mini"></el-page-header>
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
            <el-input v-model.trim="entity.Title" placeholder="请输入任务标题"></el-input>
          </el-form-item>
          <el-form-item label="关联需求" prop="RequirementId" class="requirtment-item">
            <el-select filterable remote v-model="entity.RequirementId" :remote-method="getRequirements"
              placeholder="请输入标题搜索关联需求">
              <el-option v-for="item in requirements" :key="item.Id" :label="item.Title" :value="item.Id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指派给" prop="UserIds">
            <el-select filterable multiple v-model="entity.UserIds" placeholder="请选择指派人员">
              <el-option v-for="item in members" :key="item.Id" :label="item.Name" :value="item.UserId">
                {{item.Name}}&nbsp;({{item.Job}})
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内容" prop="Content">
            <tinymce-editor v-if="!loading" v-model="entity.Content" @uploadImage="uploadImage" :disabled="disabled" :maxImageSize="2097152"></tinymce-editor>
          </el-form-item>
          <el-form-item>
            <el-upload class="upload-demo" action="" :http-request="uploadFile" :file-list="fileList"
              :on-remove="removeFile" :limit="5">
              <el-button type="text" class="text-warning">
                <font-awesome-icon fas icon="paperclip"></font-awesome-icon>&nbsp;添加附件
              </el-button>
              <div slot="tip" class="el-upload__tip">只能上传文档、压缩、图片文件，且不超过20M，最多上传5个附件</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="优先级" prop="Priority">
            <el-radio-group v-model="entity.Priority">
              <el-radio :label="0">
                <font-awesome-icon fas icon="unlock-alt"></font-awesome-icon>&nbsp;
                <span>级别一</span>
                <div class="tips">该项任务不紧急也不重要，自由安排。</div>
              </el-radio>
              <el-radio :label="1">
                <font-awesome-icon fas icon="calendar-alt"></font-awesome-icon>&nbsp;
                <span>级别二</span>
                <div class="tips">该项任务不紧急但比较重要，需要提前计划。</div>
              </el-radio>
              <el-radio :label="2">
                <font-awesome-icon fas icon="hourglass-half"></font-awesome-icon>&nbsp;
                <span>级别三</span>
                <div class="tips">该项任务紧急且比较重要，需要立即安排。</div>
              </el-radio>
              <el-radio :label="3">
                <font-awesome-icon fas icon="exclamation-triangle"></font-awesome-icon>&nbsp;
                <span>级别四</span>
                <div class="tips">该项任务紧急且严重，需要放弃其他工作优先完成。</div>
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
import { PROJECT_DETAIL, PROJECT_TASK_FORM } from '../../../../router/pms-router'

// 项目任务
export default {
  name: PROJECT_TASK_FORM.name,
  data () {
    return {
      fileList: [], // 附件列表
      disabled: true, // 允许编辑
      isAdd: false, // 表单是否添加模式
      members: [], // 成员列表
      requirements: [], // 需求列表
      selectedUserIds: [], // 任务选中的人员
      entity: {}, // 当前对象
      validationRules: {
        Title: [{ required: true, message: '请先填写需求标题' }, { min: 2, max: 50, message: '长度在2到50个字符' }],
        Content: [{ required: true, message: '请先填写需求内容' }],
        RequirementId: [{ required: true, message: '请选择关联需求' }],
        UserIds: [{ required: true, message: '请指定任务人员' }],
        Priority: [{ required: true, message: '请选择任务优先级' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.fileList = []
      this.entity = {
        Id: this.$store.state.guid,
        UserIds: [],
        Files: [],
        Priority: 0,
        Status: 0,
        Content: '',
        ...this.$route.params
      }
      this.isAdd = this.$route.params.isAdd
      if (this.isAdd) {
        this.disabled = false
      } else {
        const fileList = []
        this.entity.Files.forEach(e => fileList.push({ name: e.FileName, url: e.Url }))
        this.fileList = fileList
      }
      if (this.entity.RequirementId) {
        this.getRequirement(this.entity.RequirementId)
      }
      this.getMembers()
      this.$nextTick(() => { this.$refs.form.clearValidate() })
    },
    getMembers () {
      const url = this.$root.getApi(API.KEY, API.MEMBER.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.get(url).then(response => {
        this.members = response
      })
    },
    getRequirements (key) {
      const url = this.$root.getApi(API.KEY, API.REQUIREMENT.URL)
      this.axios.get(`${url}/1/10`, {
        params: {
          projectId: this.entity.ProjectId,
          key: key
        }
      }).then(response => {
        this.requirements = response.Items
      })
    },
    getRequirement (requirementId) {
      const url = this.$root.getApi(API.KEY, (API.REQUIREMENT.URL + '/' + requirementId)) + `?projectId=${this.entity.ProjectId}`
      this.axios.get(url).then(response => {
        this.requirements = [response]
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
      const url = this.$root.getApi(API.KEY, API.TASK.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.TASK.URL) + `?projectId=${this.entity.ProjectId}`
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
      const url = this.$root.getApi(API.KEY, API.TASK.IMAGES.replace(/{id}/, this.entity.Id)) + `?projectId=${this.entity.ProjectId}`

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
      const url = this.$root.getApi(API.KEY, API.TASK.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.delete(`${url}/${this.entity.Id}`)
    },
    uploadFile (upload) {
      const formData = new FormData()
      formData.append('files', upload.file, upload.file.name)
      const url = this.$root.getApi(API.KEY, API.TASK.FILE).replace(/{id}/, this.entity.Id) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(`${url}`, formData).then(response => {
        this.entity.Files.push({
          FileName: response.Data.Result.Original,
          FileSize: upload.file.size,
          Url: response.Data.Result.Url
        })
      })
    },
    removeFile (file, fileList) {
      const index = this.entity.Files.findIndex(w => w.FileName === file.name)
      if (index > -1) {
        this.entity.Files.splice(index, 1)
      }
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
