<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header">
      <label class="title">{{entity.Title + '的历史记录'}}</label>
    </el-card>
    <el-card>
      <el-table highlight-current-row border :data="list" @row-dblclick="rowDblclick" size="mini" height="400" class="ofa-table">
        <el-table-column width="50" type="index"></el-table-column>
        <el-table-column show-overflow-tooltip prop="Title" label="标题" width="200"></el-table-column>
        <el-table-column show-overflow-tooltip prop="Remark" label="备注"></el-table-column>
        <el-table-column show-overflow-tooltip prop="VersionRemark" label="版本记录"></el-table-column>
        <el-table-column prop="CreatorName" label="由谁创建" width="100">
          <template slot-scope="scope">
            {{scope.row.CreatorId === $store.state.user.Id ? '我' : scope.row.CreatorName}}
          </template>
        </el-table-column>
        <el-table-column prop="CreateTime" label="版本日期" width="120">
          <template slot-scope="props">
            {{new Date(props.row.CreateTime).toString('yyyy年MM月DD日')}}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { PROJECT_REQUIREMENT_RECORD, PROJECT_REQUIREMENT_DETAIL } from '../../../../router/pms-router'
import API from '../../../../apis/pms-api'

// 需求历史
export default {
  name: PROJECT_REQUIREMENT_RECORD.name,
  data () {
    return {
      loading: false, // 加载中
      entity: {}, // 需求实体
      list: [] // 历史需求列表
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.entity = this.$route.params
        this.get()
      }
    },
    get () {
      this.loading = true
      let url = this.$root.getApi(API.KEY, API.REQUIREMENT.RECORD)
      url = url.replace(/{requirementId}/, this.entity.Id)
      this.axios.get(url, {
        params: { projectId: this.entity.ProjectId }
      }).then(response => {
        this.loading = false
        this.list = response
      })
    },
    rowDblclick (row) {
      this.toDetailPage({ entity: row })
    },
    toDetailPage (params) {
      this.$root.browser.navigate({ ...PROJECT_REQUIREMENT_DETAIL, params: params })
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
