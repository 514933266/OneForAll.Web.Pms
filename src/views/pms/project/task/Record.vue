<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header">
      <label class="title">{{entity.Title + '的进度明细'}}</label>
    </el-card>
    <el-card>
      <el-table highlight-current-row border :data="list" size="mini" class="ofa-table">
        <el-table-column width="50" type="index"></el-table-column>
        <el-table-column show-overflow-tooltip prop="UserName" label="指派给">
          <template slot-scope="scope">{{scope.row.UserNickName}}<label
              class="ofa-text-primary">({{ scope.row.UserName }})</label></template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="EstimateHours" label="预估工时"></el-table-column>
        <el-table-column show-overflow-tooltip prop="ActualHours" label="实际工时"></el-table-column>
        <el-table-column show-overflow-tooltip prop="StartTime" label="开始时间"></el-table-column>
        <el-table-column show-overflow-tooltip prop="FinishTime" label="完成时间"></el-table-column>
        <el-table-column show-overflow-tooltip prop="Status" label="进度">
          <template slot-scope="scope">
            <el-popover v-if="scope.row.Status > 0" placement="left" title="时间线" width="360" trigger="hover">
              <el-timeline>
                <el-timeline-item v-for="(record, index) in scope.row.Records" :key="index"
                  :timestamp="record.CreateTime">
                  {{status[record.Status].label}}
                </el-timeline-item>
              </el-timeline>
              <el-button type="text" slot="reference">{{status[scope.row.Status].label}}</el-button>
            </el-popover>
            <labe v-else>{{status[scope.row.Status].label}}</labe>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { PROJECT_TASK_RECORD } from '../../../../router/pms-router'
import API from '../../../../apis/pms-api'
import { TASK_MEMBER_STATUS } from '../../../../assets/js/pms-const'

// 任务明细
export default {
  name: PROJECT_TASK_RECORD.name,
  data () {
    return {
      status: TASK_MEMBER_STATUS, // 子任务状态
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
        this.entity = { ...this.$route.params }
        this.get()
      }
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.TASK.DETAILS.replace(/{id}/, this.entity.Id)) + `?projectId=${this.entity.ProjectId}`
      this.axios.get(url).then(response => {
        this.loading = false
        this.list = response
      })
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
