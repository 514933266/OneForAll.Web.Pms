<template>
  <el-container>
    <el-header class="ofa-work-box">
      <span>
        <el-button class="ofa-button" size="mini" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
      </span>
      <span>
        <search-input enterable v-model="searchOption.key" @click="search" size="mini" placeholder="输入名称搜索">
        </search-input>
      </span>
    </el-header>
    <el-table highlight-current-row border v-loading="loading" ref="table" size="mini" :data="list" class="ofa-table">
      <el-table-column width="50" label="#">
        <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
      </el-table-column>
      <el-table-column prop="Title" label="标题"></el-table-column>
      <el-table-column sortable label="优先级" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="priorityVariants[scope.row.Priority]" style="width:28px;height:28px;border-radius: 50%;">
            {{scope.row.Priority + 1}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column sortable label="进度" width="100">
        <template slot-scope="scope">
          {{status[scope.row.Status].label}}
        </template>
      </el-table-column>
      <el-table-column prop="CreatorName" label="由谁创建" width="100">
        <template slot-scope="scope">
          {{scope.row.CreatorId === $store.state.user.Id ? '我' : scope.row.CreatorName}}
        </template>
      </el-table-column>
      <el-table-column prop="CreatorTime" label="创建日期" width="120">
        <template slot-scope="scope">
          {{new Date(scope.row.CreateTime).toString('yyyy-MM-dd hh:ss')}}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="toRecordPage(scope.row)" type="text" size="mini" class="ofa-text-warning">
            任务明细
          </el-button>
          <el-button @click="update(scope.row)" type="text" size="mini">
            修改
          </el-button>
          <el-button @click="del(scope.row)" type="text" size="mini" class="ofa-text-danger">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
      @current-change="pageIndexChange">
    </el-pagination>
  </el-container>
</template>

<script>
import API from '../../../../apis/pms-api'
import { TASK_STATUS } from '../../../../assets/js/pms-const'
import { PROJECT_TASK, PROJECT_TASK_FORM, PROJECT_TASK_RECORD } from '../../../../router/pms-router'

// 项目任务
export default {
  name: PROJECT_TASK.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      status: TASK_STATUS, // 任务状态
      searchOption: {
        key: '' // 关键字
      },
      loading: false, // 加载中
      list: [], // 需求列表
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      priorityVariants: [
        'success',
        'primary',
        'warning',
        'danger'], // 优先级标记样式
      timelineStatus: [
        { text: '未开始' },
        { text: '开始了任务', type: 'primary', icon: 'el-icon-caret-right' },
        { text: '暂停了任务', type: 'danger', icon: 'el-icon-cold-drink' },
        { text: '完成了任务', type: 'success', icon: 'el-icon-finished' }
      ] // 任务记录对应状态文本
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
      const url = this.$root.getApi(API.KEY, API.TASK.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          projectId: this.project.Id,
          key: this.searchOption.key
        }
      }).then(response => {
        this.loading = false
        if (response) {
          this.total = response.Total
          this.list = response.Items
        }
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => this.get())
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => this.get())
    },
    search () {
      this.pageIndex = 1
      this.$nextTick(() => this.get())
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
      this.$confirm('确认要删除选中任务？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TASK.DELETE) + `?projectId=${this.project.Id}`
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (entity) {
      this.$root.browser.navigate({ ...PROJECT_TASK_FORM, params: { ...entity, ProjectId: this.project.Id } })
    },
    toRecordPage (entity) {
      this.$root.browser.navigate({ ...PROJECT_TASK_RECORD, params: { ...entity, ProjectId: this.project.Id } })
    }
  }
}
</script>

<style lang="scss" scoped>
.content-box {
  max-height: 600px;
  overflow: auto;
}
</style>
