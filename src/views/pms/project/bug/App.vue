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
    <el-table highlight-current-row border v-loading="loading" size="mini" :data="list" class="ofa-table">
      <el-table-column width="50" label="#">
        <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
      </el-table-column>
      <el-table-column prop="Title" label="标题">
        <template slot-scope="scope">
          <el-popover width="1080" trigger="click">
            <div v-html="scope.row.Content"></div>
            <el-button slot="reference" type="text">{{scope.row.Title}}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template slot-scope="scope">
          {{types[scope.row.Type].label}}
        </template>
      </el-table-column>
      <el-table-column sortable label="优先级" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="priorityVariants[scope.row.Priority]" style="width:28px;height:28px;border-radius: 50%;">
            {{scope.row.Priority + 1}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column sortable label="严重程度" align="center" width="120">
        <template slot-scope="scope">
          <font-awesome-icon fas icon="fire-alt" :class="priorityVariants[scope.row.Level]">
          </font-awesome-icon>
          {{levels[scope.row.Level].label}}
        </template>
      </el-table-column>
      <el-table-column label="指派给" prop="UserNickName" width="100"></el-table-column>
      <el-table-column sortable label="状态" width="100">
        <template slot-scope="scope">
          {{status[scope.row.Status].label}}
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
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
      @current-change="pageIndexChange">
    </el-pagination>
  </el-container>
</template>

<script>
import API from '../../../../apis/pms-api'
import { BUG_TYPE, BUG_LEVEL, BUG_STATUS } from '../../../../assets/js/pms-const'
import { PROJECT_BUG, PROJECT_BUG_FORM } from '../../../../router/pms-router'

export default {
  name: PROJECT_BUG.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      types: BUG_TYPE, // 类型
      levels: BUG_LEVEL, // 严重程度
      status: BUG_STATUS, // 完成状态
      searchOption: {
        key: '' // 关键字
      },
      loading: false, // 加载中
      dialogVisiable: false, // 表单弹窗显示
      entity: {}, // 选中的实体
      list: [], // 任务列表
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      priorityVariants: [
        'ofa-text-success',
        'ofa-text-primary',
        'ofa-text-warning',
        'ofa-text-danger'
      ] // 优先级标记样式
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
      const url = this.$root.getApi(API.KEY, API.BUG.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          projectId: this.project.Id,
          key: this.searchOption.key
        }
      }).then(response => {
        this.loading = false
        this.total = response.Total
        this.list = response.Items
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
      this.$confirm('确认要删除选中Bug？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.BUG.DELETE) + `?projectId=${this.project.Id}`
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (entity) {
      this.$root.browser.navigate({ ...PROJECT_BUG_FORM, params: { ...entity, ProjectId: this.project.Id } })
    }
  }
}
</script>
