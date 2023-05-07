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
    <el-table highlight-current-row border ref="table" size="mini" :data="list" class="ofa-table">
      <el-table-column width="50" type="index" label="#"></el-table-column>
      <el-table-column prop="Title" label="标题"></el-table-column>
      <el-table-column prop="Status" label="状态" width="100">
        <template slot-scope="scope">
          {{status[scope.row.Status].label}}
        </template>
      </el-table-column>
      <el-table-column prop="CreatorId" label="由谁创建" width="100">
        <template slot-scope="scope">
          {{scope.row.CreatorId === $store.state.user.Id ? '我' : scope.row.CreatorName}}
        </template>
      </el-table-column>
      <el-table-column prop="BeginTime" label="开始时间" width="120">
        <template slot-scope="scope">
          {{new Date(scope.row.BeginTime).toString('yyyy年MM月dd日')}}
        </template>
      </el-table-column>
      <el-table-column prop="EndTime" label="结束时间" width="120">
        <template slot-scope="scope">
          {{new Date(scope.row.EndTime).toString('yyyy年MM月dd日')}}
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
import { PROJECT_MILESTONE, PROJECT_MILESTONE_FORM } from '../../../../router/pms-router'
import { MILESTONE_STATUS } from '../../../../assets/js/pms-const'

// 项目里程碑
export default {
  name: PROJECT_MILESTONE.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      status: MILESTONE_STATUS, // 状态
      searchOption: {
        key: '' // 关键字
      },
      loading: false, // 加载中
      dialogVisiable: false, // 表单弹窗显示
      isAdd: false, // 表单是否添加模式
      entity: {}, // 选中的实体
      list: [] // 任务列表
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
      const url = this.$root.getApi(API.KEY, API.MILESTONE.URL)
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
    search () {
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
      const url = this.$root.getApi(API.KEY, API.MILESTONE.DELETE) + `?projectId=${this.project.Id}`
      this.$confirm('确认要删除选中里程碑？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    toFormPage (entity) {
      this.$root.browser.navigate({ ...PROJECT_MILESTONE_FORM, params: { ...entity, ProjectId: this.project.Id } })
    }
  }
}
</script>
