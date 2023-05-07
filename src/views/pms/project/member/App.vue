<template>
  <div class="ofa-container column">
    <div class="select-member-box">
      <el-select multiple filterable remote v-model="selectedUserIds" :remote-method="getTeamMembers" size="mini"
        placeholder="请输入用户账号查找">
        <el-option v-for="item in members" :key="item.Id" :value="item.Id" :label="item.Name">
          {{item.Name}}
          <label style="float:right;padding-right:20px;">{{item.Job}}</label>
        </el-option>
      </el-select>
    </div>
    <div class="button-box">
      <el-button @click="add" type="primary" size="mini">
        <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加选择成员
      </el-button>
    </div>
    <el-table highlight-current-row border :data="list" ref="table" size="mini" class="member-table">
      <el-table-column width="50" type="index"></el-table-column>
      <el-table-column prop="Name" label="名称"></el-table-column>
      <el-table-column prop="UserName" label="系统账号">
        <template slot-scope="scope">{{ scope.row.UserName ? scope.row.UserName : '未绑定' }}</template>
      </el-table-column>
      <el-table-column prop="Job" label="岗位"></el-table-column>
      <el-table-column label="操作" width="50">
        <template slot-scope="scope">
          <el-tooltip content="移除该成员" placement="top">
            <el-button @click="del(scope.row)" type="text" class="ofa-text-danger">
              <font-awesome-icon fas icon="minus"></font-awesome-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../../apis/pms-api'

export default {
  name: 'PMSProjectMember',
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      list: [], // 成员列表
      members: [], // 团队成员列表
      selectedUserIds: [] // 选中的用户id集合
    }
  },
  methods: {
    init () {
      if (!this.loading) {
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.MEMBER.URL) + `?projectId=${this.project.Id}`
      this.axios.get(url).then(response => {
        if (response) {
          this.list = response
        }
      })
    },
    getTeamMembers (key) {
      const url = this.$root.getApi(API.KEY, API.TEAM_MEMBER.URL)
      this.axios.get(url, {
        params: { key: key }
      }).then(response => {
        this.members = response
      })
    },
    add () {
      if (!this.checkHadSelection()) return false
      const url = this.$root.getApi(API.KEY, API.MEMBER.URL) + `?projectId=${this.project.Id}`
      this.axios.post(url, this.selectedUserIds).then(response => {
        if (response) this.get()
      })
    },
    del (entity) {
      const url = this.$root.getApi(API.KEY, API.MEMBER.DELETE).replace(/{id}/, entity.Id) + `?projectId=${this.project.Id}`
      this.axios.delete(url).then(response => {
        if (response) {
          for (let index = 0; index < this.list.length; index++) {
            const element = this.list[index]
            if (element.Id === entity.Id) this.list.splice(index, 1)
          }
        }
      })
    },
    checkHadSelection () {
      if (this.selectedUserIds.length < 1) {
        this.$message.error('请先选择要加入项目的成员')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .select-member-box {
  border: 1px solid #ebeef5;
  padding: 1em;

  .el-select,
  .el-input,
  input {
    width: 100%;
  }

  .el-image,
  img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    vertical-align: middle;
  }
}

.button-box {
  border: 1px solid #ebeef5;
  border-top: none;
  padding: 1rem;
  text-align: left;
}

.member-table {
  margin-top: 30px;
  border-radius: 4px 4px 0 0;
  overflow-y: auto;
  border: 1px solid #ebeef5;

  .thead {
    text-align: left;
    font-size: 1rem;
    font-weight: normal;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #ebeef5;

    li {
      padding: 0.75rem;
      float: none;
    }

    span {
      font-weight: bold;
    }
  }

  svg {
    cursor: pointer;
  }
}
</style>
