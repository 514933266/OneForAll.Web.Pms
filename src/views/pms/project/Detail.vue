<template>
  <div class="ofa-container column">
    <el-card content-position="left" shadow="hover">
      <div class="form-header">
        <el-page-header @back="goBack" :content="entity.Name" size="mini">
        </el-page-header>
      </div>
    </el-card>
    <el-tabs v-model="activeTab" @tab-click="tabClick" tab-position="left" type="border-card" class="table-card">
      <el-tab-pane label="项目" name="project">
        <span slot="label">
          <font-awesome-icon fas icon="desktop"></font-awesome-icon>&nbsp;项目
        </span>
        <div class="top-box">
          <el-tooltip :content="scope.tips" placement="bottom">
            <el-button class="pms-btn btn-scope">
              <font-awesome-icon fas icon="lock"></font-awesome-icon>
              {{scope.value}}
            </el-button>
          </el-tooltip>
          <el-button-group>
            <el-tooltip content="编辑信息" placement="bottom">
              <el-button class="btn-edit" @click="toFormPage">
                <font-awesome-icon fas icon="pen"></font-awesome-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="共享" placement="bottom">
              <el-button class="btn-share">
                <font-awesome-icon fas icon="wifi"></font-awesome-icon>
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
        <div class="pic-box">
          <div class="pic">{{entity.Name.substring(0, 1)}}</div>
        </div>
        <div class="info-box">
          <div class="name">
            <label>{{entity.Name}}</label>
          </div>
          <div class="remark">
            <label>{{entity.Remark}}</label>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="成员" name="member">
        <span slot="label">
          <font-awesome-icon fas icon="users"></font-awesome-icon>&nbsp;成员
        </span>
        <member :project="entity" ref="member"></member>
      </el-tab-pane>
      <el-tab-pane label="需求" name="requirement">
        <span slot="label">
          <font-awesome-icon fas icon="file-alt"></font-awesome-icon>&nbsp;需求
        </span>
        <requirement :project="entity" ref="requirement"></requirement>
      </el-tab-pane>
      <el-tab-pane label="任务" name="task">
        <span slot="label">
          <font-awesome-icon fas icon="tasks"></font-awesome-icon>&nbsp;任务
        </span>
        <task :project="entity" ref="task"></task>
      </el-tab-pane>
      <el-tab-pane label="Bug" name="bug">
        <span slot="label">
          <font-awesome-icon fas icon="bug"></font-awesome-icon>&nbsp;Bug
        </span>
        <bug :project="entity" ref="bug"></bug>
      </el-tab-pane>
      <el-tab-pane label="里程碑" name="milestone">
        <span slot="label">
          <font-awesome-icon fas icon="bookmark"></font-awesome-icon>&nbsp;里程碑
        </span>
        <milestone :project="entity" ref="milestone"></milestone>
      </el-tab-pane>
      <el-tab-pane label="风险" name="risk">
        <span slot="label">
          <font-awesome-icon fas icon="chart-line"></font-awesome-icon>&nbsp;风险
        </span>
        <risk :project="entity" ref="risk"></risk>
      </el-tab-pane>
      <el-tab-pane label="实体" name="entityTable">
        <span slot="label">
          <font-awesome-icon fas icon="table"></font-awesome-icon>&nbsp;实体
        </span>
        <entity-table :project="entity" ref="entityTable"></entity-table>
      </el-tab-pane>
      <el-tab-pane label="代码生成" name="codeStructure">
        <span slot="label">
          <font-awesome-icon fas icon="code"></font-awesome-icon>&nbsp;代码生成
        </span>
        <code-structure :project="entity" ref="codeStructure"></code-structure>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import API from '../../../apis/pms-api'
import Member from './member/App'
import Requirement from './requirement/App'
import Task from './task/App'
import Bug from './bug/App'
import Milestone from './milestone/App'
import Risk from './risk/App'
import EntityTable from './entityTable/App'
import CodeStructure from './codeStructure/App'

import {
  PROJECT,
  PROJECT_DETAIL,
  PROJECT_FORM
} from '../../../router/pms-router'

export default {
  name: PROJECT_DETAIL.name,
  data () {
    return {
      activeTab: 'project',
      entity: { Name: '项目明细' }, // 项目
      memberStatistics: [] // 成员任务统计
    }
  },
  computed: {
    scope () {
      switch (this.entity.Scope) {
        case 0: return { value: 'Private', tips: '项目必须明确授权给每个用户访问。' }
        case 1: return { value: 'Internal', tips: '项目可以被所有已登录用户克隆。' }
        case 2: return { value: 'Public', tips: '项目可以被任何用户克隆。' }
        default: return { value: 'Error', tips: '异常' }
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.$route.name === PROJECT_DETAIL.name) {
        this.entity = { ...this.$route.params }
        this.tabClick()
      }
    },
    getMemberStatistics () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.PROJECT.MEMBER_STATISTICS.replace(/{id}/, this.entity.Id))
      this.axios.get(url).then(response => {
        this.memberStatistics = response
        this.loading = false
      })
    },
    tabClick () {
      switch (this.activeTab) {
        case 'project': break
        case 'member': this.$refs.member.init(); break
        case 'requirement': this.$refs.requirement.init(); break
        case 'task': this.$refs.task.init(); break
        case 'bug': this.$refs.bug.init(); break
        case 'milestone': this.$refs.milestone.init(); break
        case 'risk': this.$refs.risk.init(); break
        case 'entityTable': this.$refs.entityTable.init(); break
        case 'codeStructure': this.$refs.codeStructure.init(); break
      }
    },
    toFormPage () {
      this.$root.browser.navigate({
        ...PROJECT_FORM,
        params: {
          isAdd: false,
          entity: this.entity
        }
      })
    },
    goBack () {
      this.$root.browser.navigate({ ...PROJECT, params: {} })
    }
  },
  created () {
    this.init()
  },
  components: {
    Member,
    Requirement,
    Task,
    Bug,
    Milestone,
    Risk,
    EntityTable,
    CodeStructure
  }
}
</script>

<style lang="scss" scoped>
.top-box {
  display: flex;
  justify-content: space-between;
  padding: 0.55rem 0.55rem;

  button {
    min-width: 45px;
    min-height: 45px;
    padding: 0.75rem;
    border-radius: 2px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: .4px;
  }

  .btn-edit {
    margin-right: 0.25rem;
  }
}

.pic-box {
  margin-top: -20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;

  .pic {
    border-radius: 50%;
    width: 90px;
    height: 90px;
    background: rgba(27, 154, 247, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 2rem;
    font-weight: bold;
  }
}

.info-box {
  margin-bottom: 50px;
  text-align: center;
  font-size: 1.25rem;

  .remark {
    color: #888;
    font-size: 1rem;
  }
}

.member-box {
  margin-top: 20px;
}

.el-image,
img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  vertical-align: middle;
}

.project-container {
  display: flex;
  flex-direction: column;

  .el-tabs {
    flex: 1;
    margin-top: 20px;
    background-color: #fff;
    display: flex;
  }

  /deep/ .el-tabs__content {
    flex: 1;
    display: flex;

    .el-tab-pane {
      flex: 1;
      display: flex;
    }
  }
}
</style>
