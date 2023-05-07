<template>
  <div class="ofa-container">
    <div class="l-container">
      <el-menu :default-active="activeTab" @select="selectMenu">
        <el-menu-item index="0">
          <font-awesome-icon fas icon="user-circle"></font-awesome-icon>&nbsp;
          <span class="title">我参与的项目</span>
        </el-menu-item>
        <el-menu-item index="1">
          <font-awesome-icon fas icon="users"></font-awesome-icon>&nbsp;
          <span class="title">团队项目</span>
        </el-menu-item>
        <el-menu-item index="2">
          <font-awesome-icon fas icon="user-shield"></font-awesome-icon>&nbsp;
          <span class="title">个人项目</span>
        </el-menu-item>
        <el-menu-item index="3">
          <font-awesome-icon fas icon="star"></font-awesome-icon>&nbsp;
          <span class="title">星标项目</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="r-container">
      <spinner v-if="loading"></spinner>
      <div v-else class="project-card-box">
        <el-card v-for="item in list" :key="item.Id" shadow="hover" class="project-card">
          <div class="project-box" @click="toDetailPage(item)">
            <div>
              <el-tooltip :content="item.IsStar ? '星标项目' : '普通项目'">
                <el-button
                  :class="['star', item.IsStar ? 'ofa-text-warning' : 'ofa-text-grey', item.editable ? 'cursor' : '']"
                  @click.stop="setStar(item)" type="text">
                  <font-awesome-icon fas icon="star"></font-awesome-icon>
                </el-button>
              </el-tooltip>
              <label class="title">
                {{item.Name}}
              </label>
              <div class="remark ofa-text-grey">{{item.Remark}}</div>
            </div>
            <div class="task-box"></div>
          </div>
        </el-card>
        <el-card shadow="hover" class="project-card new">
          <div class="project-box">
            <el-button @click="toFormPage" type="text">
              <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;创建一个新项目
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/pms-api'
import {
  PROJECT,
  PROJECT_FORM,
  PROJECT_DETAIL
} from '../../../router/pms-router'

export default {
  name: PROJECT.name,
  data () {
    return {
      key: '', // 关键字
      loading: false, // 加载中
      list: [{}], // 项目列表
      activeTab: '0' // 激活的标签页
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.PROJECT.URL)
      this.axios.get(url, {
        params: { scope: this.activeTab }
      }).then(response => {
        this.list = response
        this.loading = false
      })
    },
    selectMenu (index) {
      this.activeTab = index
      this.get()
    },
    checkEditable (entity) {
      if (entity.CreatorId === this.$store.state.user.Id) {
        return true
      } else {
        return false
      }
    },
    setStar (entity, index) {
      if (!entity.editable) return
      const url = this.$root.getApi(API.KEY, API.PROJECT.STAR.replace(/{id}/, entity.Id))
      this.axios.patch(url).then(response => {
        if (response.Status) {
          this.$set(this.list, index, { ...entity, IsStar: !entity.IsStar })
        }
      })
    },
    getSubName (str) {
      return (str && str.length > 0) ? str.substring(0, 1) : 'P'
    },
    toFormPage () {
      this.$root.navigate({ ...PROJECT_FORM, params: { isAdd: true } })
    },
    toDetailPage (entity) {
      this.$root.navigate({ ...PROJECT_DETAIL, params: entity })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.cursor {
  cursor: pointer;
}
.ofa-container {
  background: #fff;

  .l-container {
    display: flex;
    flex-direction: column;
    width: 300px;
    border-right: 1px solid #EBEEF5;

    .el-menu {
      background: #fff;
      border-right: 0;
    }

    .el-menu svg {
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
  }

  .r-container {
    flex: 1;
    display: flex;
    padding: 50px;
  }

  .project-card-box {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }

  .project-card {
    margin: 0 20px 20px 0;
    width: 320px;
    height: 180px;
    cursor: pointer;

    .project-box {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .title {
        font-size: 1rem;
      }

      .remark {
        margin-top: 10px;
      }

      .star {
        font-size: 16px;
      }

      .task-box {
        display: flex;

        .num {
          margin-right: 10px;
        }
      }
    }
  }

  .project-card.new {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    color: #909399;
  }
}
</style>
