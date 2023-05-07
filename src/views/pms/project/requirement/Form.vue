<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" :content="isAdd ? '新建项目需求' : '编辑需求'" size="mini"></el-page-header>
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
        <el-form status-icon :model="entity" :rules="validationRules" :disabled="disabled" ref="form" label-width="120px" class="form"
          size="mini">
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" placeholder="请输入需求标题"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="Remark">
            <el-input show-word-limit v-model="entity.Remark" :rows="5" type="textarea" maxlength="100"
              placeholder="请输入需求简单描述"></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="Content">
            <tinymce-editor v-if="!loading" v-model="entity.Content" @uploadImage="uploadImage" :maxImageSize="2097152"></tinymce-editor>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import API from '../../../../apis/pms-api'
import { PROJECT_DETAIL, PROJECT_REQUIREMENT_FORM } from '../../../../router/pms-router'

// 项目需求表单
export default {
  name: PROJECT_REQUIREMENT_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {}, // 表单实体
      validationRules: {
        Title: [{ required: true, message: '请先填写需求标题' }, { min: 2, max: 50, message: '长度在2到50个字符' }],
        Content: [{ required: true, message: '请先填写需求内容' }]
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
        this.entity = { Scope: 0, Content: '', ...this.$route.params }
        this.isAdd = this.$route.params.isAdd
        if (this.isAdd) {
          this.disabled = false
        }
        this.loading = false
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
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
      const url = this.$root.getApi(API.KEY, API.REQUIREMENT.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.goBack()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.REQUIREMENT.URL) + `?projectId=${this.entity.ProjectId}`
      this.$prompt('请填写新版本变更内容', '温馨提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const newModel = { ...this.entity, VersionRemark: value }
        this.axios.put(url, newModel).then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
      })
    },
    del () {
      const url = this.$root.getApi(API.KEY, API.REQUIREMENT.URL) + `?projectId=${this.entity.ProjectId}`
      this.axios.delete(`${url}/${this.entity.Id}`)
    },
    uploadImage (upload) {
      const formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      const requirementId = this.entity.Id ? this.entity.Id : this.$store.state.guid
      const url = this.$root.getApi(API.KEY, API.REQUIREMENT.IMAGES.replace(/{id}/, requirementId)) + `?projectId=${this.entity.ProjectId}`

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
.form {

  .el-input,
  input {
    width: 100%;
  }

  .quillWrapper .ql-editor {
    height: 350px;
  }
}
</style>
