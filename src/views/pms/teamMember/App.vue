<template>
  <el-container>
    <el-header>
      <el-row type="flex" justify="space-between" class="header">
        <span>
          <el-button @click="add" class="ofa-button" size="mini">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
          </el-button>
        </span>
        <span>
          <search-input enterable v-model="searchOption.key" @click="search" size="mini" placeholder="输入名称搜索">
          </search-input>
        </span>
      </el-row>
    </el-header>
    <el-table highlight-current-row border v-loading="loading" :data="list" size="mini" class="ofa-table">
      <el-table-column type="index" width="50" label="#" header-align="center"></el-table-column>
      <el-table-column prop="Name" label="名称"></el-table-column>
      <el-table-column prop="UserName" label="系统账号">
        <template slot-scope="scope">{{ scope.row.UserName ? scope.row.UserName : '未绑定' }}</template>
      </el-table-column>
      <el-table-column prop="Job" label="岗位"></el-table-column>
      <el-table-column label="操作" width="300" align="center" header-align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="update(scope.row)">修改</el-button>
          <el-button type="warning" size="mini" @click="showUserDialog(scope.row)">绑定系统账号
          </el-button>
          <el-button type="danger" size="mini" @click="del(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 绑定账号弹窗 -->
    <el-dialog :visible.sync="userDialogVisiable" title="绑定系统账号" width="480px" custom-class="ofa-dialog">
      <el-select filterable remote v-model="entity.UserId" :remote-method="getUsers" size="mini" placeholder="请选择账号">
        <el-option v-for="item in users" :key="item.Id" :value="item.Id" :label="item.Name">
          {{item.Name}}&nbsp;({{item.UserName}})
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisiable = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="bindAccount" size="mini">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../apis/pms-api'
import BASE_API from '../../../apis/base-api'
import { MEMBER, MEMBER_FORM } from '../../../router/pms-router'

// 团队成员
export default {
  name: MEMBER.name,
  data () {
    return {
      loading: false, // 加载中
      userDialogVisiable: false, // 绑定账号弹窗
      searchOption: {
        key: '' // 关键字
      },
      list: [], // 用户列表
      users: [], // 系统账号列表
      entity: {} // 选中用户
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    },
    headerDomain () {
      return this.$root.getApiDomain(BASE_API.KEY)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.URL)
      this.axios.get(url).then(response => {
        this.list = response
        this.$nextTick(() => { this.loading = false })
      })
    },
    search () {
      this.$nextTick(() => this.get())
    },
    getUsers (key) {
      const url = this.$root.getApi(BASE_API.KEY, BASE_API.USER.URL)
      this.axios.get(url, {
        params: { key: key }
      }).then(response => {
        this.users = response
      })
    },
    add () {
      this.toFormPage({}, true)
    },
    update (entity) {
      this.toFormPage(entity, false)
    },
    del (entity) {
      this.$confirm('确认要删除选中团队成员？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    showUserDialog (entity) {
      this.entity = entity
      this.userDialogVisiable = true
    },
    bindAccount (entity) {
      const user = this.users.find(w => w.Id === entity.UserId)
      if (user) {
        this.entity.UserName = user.UserName
        const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.ACCOUNT.replace(/{id}/, entity.Id))
        this.axios.patch(url, entity).then(response => {
          if (response.Status) {
            this.userDialogVisiable = false
            this.get()
          }
        })
      }
    },
    toFormPage (entity, isAdd) {
      this.$root.browser.navigate({
        ...MEMBER_FORM,
        params: {
          isAdd: isAdd,
          entity: entity
        }
      })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.el-header {
  padding: 0 20px;
  background: #fff;
  margin-bottom: 10px;
}
.header {
  align-items: center;
  height: 100%;
}

.ofa-dialog {

  .el-select,
  .el-input,
  input {
    width: 100%;
  }

  .user-icon {
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
}
</style>
