<template>
  <el-container>
    <el-header class="ofa-work-box">
      <span>
        <el-button class="ofa-button" size="mini" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
      </span>
      <span>
      </span>
    </el-header>
    <el-table highlight-current-row border v-loading="loading" :data="list" size="mini" class="ofa-table">
      <el-table-column width="50" type="index" label="#"></el-table-column>
      <el-table-column prop="Title" label="标题">
      </el-table-column>
      <el-table-column sortable prop="Status" label="状态" width="100">
        <template slot-scope="scope">
          {{status[scope.row.Status].label}}
        </template>
      </el-table-column>
      <el-table-column sortable prop="Priority" label="严重等级" width="100">
        <template slot-scope="scope">
          <font-awesome-icon fas icon="fire-alt" :class="priorityVariants[scope.row.Priority]">
          </font-awesome-icon>
          {{prioritys[scope.row.Priority].label}}
        </template>
      </el-table-column>
      <el-table-column prop="Remark" label="描述">
      </el-table-column>
      <el-table-column prop="CreatorId" label="由谁创建" width="100">
        <template slot-scope="scope">
          {{scope.row.CreatorId === $store.state.user.Id ? '我' : scope.row.CreatorName}}
        </template>
      </el-table-column>
      <el-table-column sortable prop="CreateTime" label="创建时间" width="140">
        <template slot-scope="scope">
          {{new Date(scope.row.CreateTime).toString('yyyy年MM月dd日 hh:ss')}}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="update(scope.row)" type="text" size="mini">
            修改
          </el-button>
          <el-button @click="del(scope.row)" type="text" size="mini" class="ofa-text-danger">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import API from '../../../../apis/pms-api'
import { PROJECT_RISK, PROJECT_RISK_FORM } from '../../../../router/pms-router'
import { RISK_STATUS, RISK_PRIORITY } from '../../../../assets/js/pms-const'

// 项目风险
export default {
  name: PROJECT_RISK.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      status: RISK_STATUS, // 状态
      prioritys: RISK_PRIORITY, // 严重等级
      searchOption: {
        key: '' // 关键字
      },
      loading: false, // 加载中
      dialogVisiable: false, // 表单弹窗显示
      entity: {}, // 实体
      list: [], // 列表
      priorityVariants: [
        'ofa-text-success',
        'ofa-text-primary',
        'ofa-text-warning',
        'ofa-text-danger'] // 优先级标记样式
    }
  },
  methods: {
    init () {
      if (!this.loading) {
        this.get()
      }
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.RISK.URL)
      this.axios.get(url, {
        params: {
          projectId: this.project.Id,
          key: this.searchOption.key
        }
      }).then(response => {
        this.list = response
        this.loading = false
      })
    },
    add () {
      this.toFormPage({ isAdd: true, ProjectId: this.project.Id })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    submitSuccess () {
      this.dialogVisiable = false
      this.get()
    },
    del (entity) {
      const url = this.$root.getApi(API.KEY, API.RISK.DELETE) + `?projectId=${this.project.Id}`
      this.$confirm('确认要删除选中风险？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (entity) {
      this.$root.browser.navigate({ ...PROJECT_RISK_FORM, params: { ...entity, ProjectId: this.project.Id } })
    }
  }
}
</script>
