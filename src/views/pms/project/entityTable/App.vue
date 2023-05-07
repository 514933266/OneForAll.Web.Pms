<template>
  <div class="ofa-table-container">
    <div class="t-box">
      <div class="tree">
        <div class="header">
          <el-button round type="plain" @click="showAddDialog" size="mini" style="margin-right:5px;">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>
          </el-button>
          <search-input enterable slotPrefix @click="get" placeholder="搜索" size="mini" v-model="searchOption.key">
          </search-input>
        </div>
        <el-tree highlight-current :data="list" @node-click="clickTreeNode" ref="tableTree" class="filter-tree"
          node-key="Id" empty-text="暂无表实体">
          <span class="custom-tree-entity" slot-scope="{ data }">
            <span>
              <font-awesome-icon fas icon="table" style="margin-right:5px;"></font-awesome-icon>
              <label>{{ data.Name }}&nbsp;</label>
              <label v-show="data.Alias" class="ofa-text-grey">({{ data.Alias }})</label>
            </span>
          </span>
        </el-tree>
      </div>
      <!-- 右侧面板 -->
      <div class="right-content">
        <div class="empty-tab">
          <div class="table-name-box">
            <label class="name">{{entity.Name}}</label>
            <el-tag v-show="entity.Alias" class="tag" effect="dark" size="mini" type="warning">{{entity.Alias}}
            </el-tag>
            <el-button round v-show="entity.Id" @click="showUpdateDialog" size="mini"
              style="margin-left:10px;width:80px;">编辑</el-button>
          </div>
          <div v-if="entity.Id" class="table-remark-box ofa-text-grey">最后由 {{entity.CreatorName}} 编辑于
            {{entity.UpdateTime.toString('yyyy-MM-dd hh:mm')}}</div>
          <div class="child-t-box">
            <div class="btn-title">
              <div v-show="entity.Id">
                <el-button @click="addFields" type="primary" size="mini">
                  <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;{{ isChangeField ? '继续添加' : '新字段' }}
                </el-button>
                <el-button v-show="isChangeField" @click="submitFields" type="success" size="mini">
                  <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存字段
                </el-button>
              </div>
            </div>
            <el-table v-loading="fieldLoading" :data="entity.Fields" row-key="Id" ref="memberTable" size="mini"
              empty-text="当前表实体未创建字段">
              <el-table-column prop="Name" label="字段名称">
                <template slot-scope="scope">
                  <label v-if="!scope.row.editable"><font-awesome-icon v-if="scope.row.IsPrimaryKey" fas icon="key" style="margin-right:4px;"></font-awesome-icon><font-awesome-icon v-if="scope.row.IsIdentity" fas icon="chess-knight" style="margin-right:4px;"></font-awesome-icon>{{scope.row.Name}}</label>
                  <el-input v-else v-model="scope.row.Name" size="mini" placeholder="必填，请输入字段名称">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="Alias" label="中文名称">
                <template slot-scope="scope">
                  <label v-if="!scope.row.editable">{{scope.row.Alias}}</label>
                  <el-input v-else v-model="scope.row.Alias" size="mini" placeholder="必填，请输入字段的中文名称">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="DbType" label="类型">
                <template slot-scope="scope">
                  <label v-if="!scope.row.editable">{{scope.row.DbType}}</label>
                  <el-input v-else v-model="scope.row.DbType" size="mini" placeholder="必填，请输入字段的数据库类型">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="IsNullable" label="是否可空" width="200">
                <template slot-scope="scope">
                  <label v-if="!scope.row.editable">{{scope.row.IsNullable ? '是' : '否'}}</label>
                  <el-select v-else v-model="scope.row.IsNullable" size="mini">
                    <el-option :value="true" label="是"></el-option>
                    <el-option :value="false" label="否"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="Remark" label="备注">
                <template slot-scope="scope">
                  <label v-if="!scope.row.editable">{{scope.row.Remark}}</label>
                  <el-input v-else v-model="scope.row.Remark" size="mini" placeholder="必填，请输入字段备注">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="updateFields(scope.row, scope.$index)">修改
                  </el-button>
                  <el-button type="text" class="ofa-text-danger" size="mini"
                    @click="delFields(scope.row, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="child-member-box">
            <div class="title">
              <font-awesome-icon fas icon="sitemap"></font-awesome-icon>&nbsp;相关表
            </div>
            <div class="btn-title">
              <div v-show="entity.Id">
                <el-button @click="contactDialogVisible = true" type="primary" size="mini">
                  <font-awesome-icon fas icon="cog"></font-awesome-icon>&nbsp;设置关联
                </el-button>
              </div>
            </div>
            <el-table v-loading="contactLoading" :data="entity.Contacts" size="mini" empty-text="当前表暂无关联表"
              max-height="400">
              <el-table-column prop="Name" label="表名">
              </el-table-column>
              <el-table-column prop="Alias" label="中文名称">
              </el-table-column>
              <el-table-column prop="Remark" label="备注">
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button type="text" class="ofa-text-danger" size="mini"
                    @click="removeContact(scope.row, scope.$index)">取消关联</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <!-- 表实体抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div class="title" slot="title">
        <span>{{isAdd ? '添加' : '编辑'}}表实体</span><label class="text-primary">DbTable</label>
      </div>
      <div>
        <el-alert center v-show="isAdd" :closable="false" type="warning" size="mini" style="margin-bottom:10px;">
          <div>
            <el-button v-loading.fullscreen.lock="creating" @click="aotuCreate" type="text" class="btn-import">
              <font-awesome-icon fas icon="hand-point-right"></font-awesome-icon>&nbsp;<u>点击此处</u>
            </el-button>，根据现有数据库生成或更新数据。
          </div>
          <div>
            <el-button @click="connectStringDialogVisible = true" type="text" class="btn-import">
              <el-tooltip class="item" effect="dark" content="尽管我们会对连接信息加密保存，但也请勿使用正式环境信息填写" placement="top-start">
                <font-awesome-icon fas icon="question-circle"></font-awesome-icon>
              </el-tooltip>
              &nbsp;<u>使用前请先配置数据库连接字符串</u>
            </el-button>，否则无法使用此功能。
          </div>
        </el-alert>
        <el-form :model="newEntity" :rules="validationRule" label-width="120px" class="form" ref="form" size="mini">
          <el-form-item label="表名称" prop="Name">
            <el-input v-model.trim="newEntity.Name" placeholder="请输入表实体名称，如User"></el-input>
          </el-form-item>
          <el-form-item label="中文名" prop="Alias">
            <el-input v-model.trim="newEntity.Alias" placeholder="请输入表的中文名称，如用户表"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="Remark">
            <el-input v-model.trim="newEntity.Remark" placeholder="请输入备注，如记录系统用户信息"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submit">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;{{isAdd ? '创建' : '保存'}}
        </el-button>
        <el-button v-show="!isAdd" type="danger" @click="del">删除
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false">
          取消
        </el-button>
      </div>
    </el-drawer>
    <!-- 表关联弹窗 -->
    <el-dialog class="ofa-dialog" :title="'添加关联表到-' + entity.Name" :visible.sync="contactDialogVisible" width="980px"
      @open="setContactList">
      <div style="margin-bottom:10px;">
        <search-input v-model="searchContactKey" slotPrefix placeholder="搜索" size="mini" style="width:200px">
        </search-input>
      </div>
      <el-table border :data="contactList.filter(data => !searchContactKey || data.Name.includes(searchContactKey))"
        @selection-change="contactSelectionChange" size="mini" empty-text="没有可关联的表" max-height="400">
        <el-table-column type="selection" width="50" header-align="center" align="center"></el-table-column>
        <el-table-column label="表名" prop="Name"></el-table-column>
        <el-table-column label="中文名称" prop="Alias"></el-table-column>
        <el-table-column label="备注" prop="Remark"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="contactDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitContact">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 连接字符串弹窗 -->
    <el-dialog class="ofa-dialog" title="数据库连接字符串设置" :visible.sync="connectStringDialogVisible" width="980px">
      <el-alert center v-show="isAdd" :closable="false" type="warning" size="mini" style="margin-bottom:10px;">
        <div class="table-remark-box ofa-text-grey">最后由 {{connectString.CreatorName}} 编辑于
          {{connectString.UpdateTime?new Date(connectString.UpdateTime).toString('yyyy-MM-dd HH:mm') : ''}}</div>
      </el-alert>
      <el-input v-model="connectString.ConnectString" size="mini"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="connectStringDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitConnectString">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from '../../../../apis/pms-api'
import { PROJECT, ENTITY_TABLE } from '../../../../router/pms-router'

// 实体
export default {
  name: ENTITY_TABLE.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      entity: {}, // 当前选中节点
      newEntity: {}, // 当前表实体实体
      connectString: {}, // 连接字符串
      list: [], // 组织架构列表
      contactList: [], // 关联表信息
      contactSelections: [], // 选中的关联表
      isAdd: true, // 是否添加模式
      creating: false, // 生成实体中
      isChangeField: false, // 编辑字段
      loading: false, // 加载中
      fieldLoading: false, // 字段加载中
      contactLoading: false, // 关联表加载中
      drawerVisiable: false, // 显示表单
      contactDialogVisible: false, // 显示关联表
      connectStringDialogVisible: false, // 显示连接字符串
      searchOption: {
        key: '' // 关键字
      },
      searchContactKey: '',
      validationRule: {
        Name: [{ required: true, message: '请先填写表名称' }, { min: 2, max: 50, message: '表实体名称长度在2~50之间' }],
        Alias: [{ required: true, message: '请先填写表中文名称' }, { min: 2, max: 30, message: '表实体名称长度在2~30之间' }],
        Remark: [{ required: true, message: '请先填写表备注' }, { min: 2, max: 500, message: '表实体名称长度在2~500之间' }]
      }
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    },
    permissions () {
      return this.$root.getPermissions(PROJECT.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (this.loading) return false
      this.get()
      this.getConnectString()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.URL)
      this.axios.get(url, {
        params: {
          projectId: this.project.Id,
          key: this.searchOption.key
        }
      }).then(response => {
        this.list = response
        this.loading = false
        if (response.length > 0) {
          const node = this.entity.Id ? this.entity : response[0]
          this.$nextTick(() => {
            this.$refs.tableTree.setCurrentKey(node.Id)
            this.clickTreeNode(null, { data: node })
          })
        }
      })
    },
    clickTreeNode (event, node) {
      this.isSortableChildTeam = false
      this.entity = { Fields: [], Contacts: [], ...node.data }
      this.getFields()
      this.getContacts()
    },
    showAddDialog () {
      this.isAdd = true
      this.newEntity = { Name: '', Remark: '' }
      this.drawerVisiable = true
    },
    showUpdateDialog () {
      this.isAdd = false
      this.newEntity = { ...this.entity }
      this.drawerVisiable = true
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    aotuCreate () {
      // 表单名称设置为空时为自动创建实体
      this.newEntity = { Name: '自动创建', Remark: '自动创建', Alias: '自动创建' }
      this.add()
    },
    add () {
      this.creating = true
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.URL)
      this.axios.post(`${url}?projectId=${this.project.Id}`, this.newEntity)
        .then(response => {
          this.creating = false
          if (response.Status) {
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.URL)
      this.axios.put(`${url}?projectId=${this.project.Id}`, this.newEntity)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    del () {
      this.newEntity = { ...this.entity }
      this.$confirm(`确认要彻底删除${this.newEntity.Name}?删除后不可恢复`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.BATCH_DELETE)
        this.axios.patch(`${url}?projectId=${this.project.Id}`, [this.newEntity.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    checkSelection () {
      if (!this.entity) {
        this.$message.error('请先选择一个表实体')
        return false
      }
      return true
    },
    getFields () {
      this.fieldLoading = true
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.FIELD).replace(/{id}/, this.entity.Id)
      this.axios.get(`${url}?projectId=${this.project.Id}`, this.entity)
        .then(response => {
          this.$set(this.entity, 'Fields', response)
          this.fieldLoading = false
        })
    },
    addFields () {
      this.isChangeField = true
      this.entity.Fields.push({ isAdd: true, editable: true, Name: '', Type: '', Nullable: 0, Remark: '' })
    },
    updateFields (field, index) {
      this.isChangeField = true
      this.$set(this.entity.Fields, index, { ...field, editable: true })
    },
    delFields (field, index) {
      this.isChangeField = true
      this.entity.Fields.splice(index, 1)
    },
    submitFields () {
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.FIELD).replace(/{id}/, this.entity.Id)
      this.axios.patch(`${url}?projectId=${this.project.Id}`, this.entity)
        .then(response => {
          if (response.Status) {
            this.isChangeField = false
            this.getFields()
          }
        })
    },
    setContactList () {
      this.contactList = this.list.filter((w) => { return w.Id !== this.entity.Id && (this.entity.Contacts.indexOf(i => i.Id === w.Id) < 0) })
    },
    contactSelectionChange (selections) {
      this.contactSelections = selections
    },
    getContacts () {
      this.contactLoading = true
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.CONTACT).replace(/{id}/, this.entity.Id)
      this.axios.get(`${url}?projectId=${this.project.Id}`, this.entity)
        .then(response => {
          this.$set(this.entity, 'Contacts', response)
          this.contactLoading = false
        })
    },
    submitContact () {
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.CONTACT).replace(/{id}/, this.entity.Id)
      const ids = this.contactSelections.map(m => m.Id)
      this.axios.post(`${url}?projectId=${this.project.Id}`, ids)
        .then(response => {
          if (response.Status) {
            this.contactDialogVisible = false
            this.getContacts()
          }
        })
    },
    removeContact (data, index) {
      const url = this.$root.getApi(API.KEY, API.ENTITY_TABLE.CONTACT).replace(/{id}/, this.entity.Id)
      this.axios.patch(`${url}?projectId=${this.project.Id}`, [data.Id])
        .then(response => {
          if (response.Status) {
            this.entity.Contacts.splice(index, 1)
          }
        })
    },
    getConnectString () {
      const url = this.$root.getApi(API.KEY, API.CONNECTION_STRING.URL)
      this.axios.get(`${url}?projectId=${this.project.Id}`)
        .then(response => {
          this.connectString = response
        })
    },
    submitConnectString () {
      const url = this.$root.getApi(API.KEY, API.CONNECTION_STRING.URL)
      this.axios.post(`${url}?projectId=${this.project.Id}`, this.connectString)
        .then(response => {
          if (response.Status) {
            this.connectStringDialogVisible = false
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
.t-box {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  border: 1px solid #ebeef5;
  color: #333;

  .tree {
    width: 300px;
    border-right: 1px solid #ebeef5;

    .header {
      display: flex;
      padding: .75rem;
      border-bottom: 1px solid #ebeef5;

      .el-button-group {
        margin-top: 10px;

        button {
          width: 50%;
        }
      }

    }

    /deep/ .el-tree {
      width: 100%;
      background: transparent;
      overflow: auto;

      .el-tree-node__content {
        padding: 10px;
      }

      .el-checkbox {
        margin-bottom: 0;
      }

      .custom-tree-entity {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: .875rem;
        padding-right: 8px;
        width: 100%;

        >span {
          text-align: left;
          display: inline-block;
        }

        button {
          width: 30px;
          height: 30px;
          margin-left: .875rem;
        }
      }
    }
  }

  .tree-label {
    display: flex;
    justify-content: center;

    >a {
      font-size: .75rem;
    }
  }

  /deep/.right-content {
    flex: 1;
    padding: 20px;
    position: relative;
    overflow: hidden;

    .btn-box {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 1;
    }
  }

  .table-name-box {
    display: flex;
    align-items: center;
    padding: 20px 0;

    .name {
      font-size: 1.25rem;
    }

    .tag {
      margin-left: 10px;
    }
  }

  .table-remark-box {
    padding: 10px 0;
  }

  .child-t-box,
  .child-member-box {
    .title {
      padding: 30px 0;
      font-size: 1.25rem;
    }

    .btn-title {
      padding: 10px;
      background: #EBEEF5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
