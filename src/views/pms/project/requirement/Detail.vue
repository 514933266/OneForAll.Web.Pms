<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header">
        <label class="title">{{'需求详情-' + entity.Title}}</label>
    </el-card>
    <div class="form-content">
      <el-card content-position="left">
        <el-form status-icon :model="entity" ref="form" label-width="120px" class="form"
          size="mini">
          <el-form-item label="版本日期" prop="CreateTime">
            {{entity.CreateTime}}
          </el-form-item>
          <el-form-item label="创建人" prop="CreatorName">
            {{entity.CreatorName}}
          </el-form-item>
          <el-form-item label="版本备注" prop="VersionRemark">
            {{entity.Remark}}
          </el-form-item>
          <el-form-item label="标题" prop="Title">
            {{entity.Title}}
          </el-form-item>
          <el-form-item label="备注" prop="Remark">
            {{entity.Remark}}
          </el-form-item>
          <el-form-item label="内容" prop="Content">
            <div v-html="entity.Content"></div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { PROJECT_REQUIREMENT_DETAIL } from '../../../../router/pms-router'

// 项目需求详情
export default {
  name: PROJECT_REQUIREMENT_DETAIL.name,
  data () {
    return {
      entity: {} // 实体
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.entity = { Scope: 0, ...this.$route.params.entity }
      this.isAdd = this.$route.params.isAdd
      if (this.isAdd) {
        this.disabled = false
      }
      this.$nextTick(() => { this.$refs.form.clearValidate() })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.title {
    font-size: 18px;
}
</style>
