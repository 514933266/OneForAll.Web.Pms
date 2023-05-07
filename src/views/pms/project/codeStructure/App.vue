<template>
  <el-container class="container">
    <div class="t-box">
      <el-aside class="tree">
        <div class="header">
          <el-button round type="plain" @click="showAddDialog" size="mini" style="margin-right:5px;">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>
          </el-button>
          <search-input enterable slotPrefix @click="get" placeholder="搜索" size="mini" v-model="searchOption.key">
          </search-input>
        </div>
        <el-tree highlight-current default-expand-all :data="list" @node-click="clickTreeNode"
          :props="{children: 'Children'}" ref="tableTree" class="filter-tree" node-key="Id" empty-text="暂无项目结构">
          <span class="custom-tree-entity" slot-scope="{ data }">
            <span>
              <font-awesome-icon fas :icon="data.icon" style="margin-right:5px;">
              </font-awesome-icon>
              <label>{{ data.Name }}</label>
            </span>
          </span>
        </el-tree>
      </el-aside>
      <!-- 右侧面板 -->
      <el-main class="content">
        <div class="empty-tab">
          <div class="table-name-box">
            <label class="name">{{entity.Name}}</label>
            <el-tag v-show="!entity.canBuildCode" class="tag" effect="dark" size="mini" type="warning">
              {{entity.label}}
            </el-tag>
            <el-button round v-show="!entity.canBuildCode" @click="showUpdateDialog" size="mini"
              style="margin-left:10px;width:80px;">编辑</el-button>
          </div>
          <div class="table-remark-box ofa-text-grey">{{entity.Remark}}</div>
          <div v-show="!entity.canBuildCode" class="table-remark-box ofa-text-grey">最后由 {{entity.CreatorName}} 编辑于
            {{entity.UpdateTime?new Date(entity.UpdateTime).toString('yyyy-MM-dd HH:mm') : ''}}</div>
          <div v-show="entity.canAddChild" class="child-table-box">
            <div class="btn-title">
              <div>
                <el-button @click="addChild" type="primary" size="mini">
                  <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加下级
                </el-button>
              </div>
            </div>
            <el-table border default-expand-all :data="entity.Children" row-key="Id" size="mini" class="code-table"
              row-class-name="name-box">
              <el-table-column label="名称" prop="Name"></el-table-column>
              <el-table-column label="类型" prop="Type" width="60" align="center" header-align="center">
                <template slot-scope="scope">
                  {{scope.row.label}}
                </template>
              </el-table-column>
              <el-table-column show-overflow-tooltip label="备注" prop="Remark"></el-table-column>
              <el-table-column label="创建人" prop="CreatorName"></el-table-column>
              <el-table-column label="最后修改时间" prop="CreatorName">
                <template slot-scope="scope">
                  {{new Date(scope.row.UpdateTime).toString('yyyy-MM-dd HH:mm')}}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="updateChild(scope.row)">修改</el-button>
                  <el-button type="text" class="ofa-text-danger" size="mini" @click="delChild(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-show="entity.canUpdTemplate" class="template-box">
            <div class="title">
              <font-awesome-icon fas icon="sitemap"></font-awesome-icon>&nbsp;模板内容
            </div>
            <div class="btn-title">
              <div>
                <el-button @click="updateTemplate" type="primary" size="mini">
                  <font-awesome-icon fas icon="cog"></font-awesome-icon>&nbsp;更新模板
                </el-button>
                <el-tooltip v-show="entity.Type === 2000" class="item" effect="dark" content="替换为数据表名称" placement="top">
                  <el-button @click="insertTextToTemplate('EntityName')" type="plain" size="mini">
                    插入[EntityName]
                  </el-button>
                </el-tooltip>
                <el-tooltip v-show="entity.Type === 2000" class="item" effect="dark" content="替换为表的中文名称"
                  placement="top">
                  <el-button @click="insertTextToTemplate('Comment')" type="plain" size="mini">
                    插入[Comment]
                  </el-button>
                </el-tooltip>
                <el-tooltip v-show="entity.Type === 2000 || entity.Type === 2001" class="item" effect="dark" content="替换为字段" placement="top">
                  <el-button @click="insertTextToTemplate('FieldBody')" type="plain" size="mini">
                    插入[FieldBody]
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <code-structure-editor v-model="entity.TemplateJson" ref="editor"></code-structure-editor>
          </div>
          <div v-show="entity.canBuildCode" class="build-box">
            <div class="btn-title">
              <span>
                <el-button @click="buildCode" type="primary" size="mini">
                  <font-awesome-icon fas icon="external-link-alt"></font-awesome-icon>&nbsp;一键生成
                </el-button>
                <el-button @click="entityDialogVisiable = true" type="primary" size="mini">
                  <font-awesome-icon fas icon="tasks"></font-awesome-icon>&nbsp;选择生成
                </el-button>
              </span>
            </div>
            <div class="title">
              <font-awesome-icon fas icon="history"></font-awesome-icon>&nbsp;我的生成记录
            </div>
            <el-table border default-expand-all v-loading="loadingRecord" :data="recordList" row-key="Id" size="mini"
              class="code-table" row-class-name="name-box">
              <el-table-column label="名称" prop="Title"></el-table-column>
              <el-table-column label="下载地址" prop="Url"></el-table-column>
              <el-table-column label="生成时间" prop="CreatorTime">
                <template slot-scope="scope">
                  {{new Date(scope.row.CreateTime).toString('yyyy-MM-dd HH:mm')}}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="downloadFile(scope.row)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-main>
    </div>
    <!-- 项目结构抽屉 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="380px"
      class="ofa-drawer">
      <div class="title" slot="title">
        <span>{{isAdd ? '添加' : '编辑'}}项目结构</span><label class="text-primary">Structure</label>
      </div>
      <div>
        <el-alert show-icon title="操作提示" type="warning">
          <div>本功能仅限开发人员使用，可根据代码结构生成文件</div>
          <div>文件类型结构需要扩展名，如user.cs</div>
        </el-alert>
        <el-form status-icon :model="newEntity" :rules="validationRule" ref="form" label-width="80px">
          <el-form-item label="名称" prop="Name">
            <el-input v-model="newEntity.Name" placeholder="请输入代码结构名称" size="mini"></el-input>
          </el-form-item>
          <el-form-item label="上级" prop="ParentId">
            <code-structure-cascader showRoot v-model="newEntity.ParentId" :projectId="project.Id" size="mini">
            </code-structure-cascader>
          </el-form-item>
          <el-form-item label="类型" prop="Type">
            <el-select v-model="newEntity.Type" size="mini">
              <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="Remark" class="remark-item">
            <el-input show-word-limit v-model="newEntity.Remark" type="textarea" class="remark-textarea"
              placeholder="请输入代码结构备注" maxlength="300" size="mini">
            </el-input>
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
    <el-dialog class="ofa-dialog" title="代码生成" :visible.sync="entityDialogVisiable" width="980px">
      <div style="margin-bottom:10px;">
        <search-input v-model="searchEntityKey" slotPrefix placeholder="搜索" size="mini" style="width:200px">
        </search-input>
      </div>
      <el-table border :data="entityList.filter(data => !searchEntityKey || data.Name.includes(searchEntityKey))"
        @selection-change="entitySelectionChange" size="mini" empty-text="未创建实体文件" max-height="400">
        <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
        <el-table-column label="名称" prop="Name"></el-table-column>
        <el-table-column label="类型" prop="Type" width="100" align="center" header-align="center">
          <template slot-scope="scope">
            {{scope.row.label}}
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="备注" prop="Remark"></el-table-column>
        <el-table-column label="创建人" prop="CreatorName"></el-table-column>
        <el-table-column label="最后修改时间" prop="CreatorName" width="160">
          <template slot-scope="scope">
            {{new Date(scope.row.UpdateTime).toString('yyyy-MM-dd HH:mm')}}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="entityDialogVisiable = false">取消</el-button>
        <el-button size="mini" type="primary" @click="buildCode">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import API from '../../../../apis/pms-api'
import { CODE_STRUCTURE } from '../../../../router/pms-router'
import { CODE_STRUCTURE_TYPE } from '../../../../assets/js/pms-const'
import CodeStructureCascader from '../../_components/CodeStructureCascader.vue'
import CodeStructureEditor from '../../_components/CodeStructureEditor.vue'

// 代码生成
export default {
  name: CODE_STRUCTURE.name,
  props: {
    project: { Type: Object }
  },
  data () {
    return {
      types: CODE_STRUCTURE_TYPE,
      isAdd: true, // 是否添加模式
      drawerVisiable: false, // 显示抽屉
      entityDialogVisiable: false, // 选择实体弹窗
      loadingRecord: false, // 生成记录加载中
      entity: {}, // 当前选中节点
      newEntity: {}, // 当前表实体实体
      topNode: { Id: 0, Name: '全部（生成代码）', Type: -1, Remark: '生成代码操作，每次都会根据代码结构生成文件，生成后下载解压覆盖项目文件即可（目前仅支持Code first模式）', Children: [] }, // 顶级节点
      list: [], // 组织架构列表
      entityList: [], // 实体列表
      entitySelectionList: [], // 实体选中列表
      recordList: [], // 生成记录列表
      searchEntityKey: '', // 实体检索关键字
      searchOption: {
        key: '' // 关键字
      },
      validationRule: {
        Name: [{ required: true, message: '请先填写代码结构名称', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2到20个字符', trigger: 'blur' }],
        Type: [{ required: true, message: '请先选择类型', trigger: 'blur' }],
        ParentId: [{ required: true, message: '请先选择上级代码结构', trigger: 'blur' }],
        Remark: [{ min: 0, max: 300, message: '最多输入300个字符', trigger: 'blur' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  methods: {
    init () {
      if (this.loading) return false
      this.get()
    },
    get () {
      this.loading = true
      this.entityList = []
      const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.URL)
      this.axios.get(url, {
        params: {
          projectId: this.project.Id,
          key: this.searchOption.key
        }
      }).then(response => {
        this.topNode.Children = response
        const newData = [this.topNode]
        this.setData(newData)
        this.list = newData
        this.loading = false
        if (response.length > 0) {
          const node = this.entity.Id ? this.entity : this.topNode
          this.$nextTick(() => {
            this.$refs.tableTree.setCurrentKey(node.Id)
            this.clickTreeNode(null, { data: node })
          })
        }
      })
    },
    setData (data) {
      // 重新组装数据，设置图标、标签、特殊属性
      data.forEach(e => {
        let type = this.types.find(w => w.value === e.Type)
        if (!type) {
          type = { label: '', icon: 'list', canAddChild: false, canBuildCode: true, canUpdTemplate: false }
        }
        e = Object.assign(e, type)
        if (e.Children && e.Children.length > 0) {
          this.setData(e.Children)
        }
        // 将实体文件加入待选列表用于选择生成实体
        if (e.Type === 2001) {
          this.entityList.push(e)
        }
      })
    },
    clickTreeNode (event, node) {
      this.isSortableChildTeam = false
      this.entity = { Fields: [], Contacts: [], ...node.data }
      if (this.entity.Type === -1) {
        this.getRecords()
      }
    },
    showAddDialog () {
      this.isAdd = true
      this.newEntity = { ParentId: '', Name: '', Type: 1000, Remark: '' }
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
    add () {
      const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.URL)
      this.axios.post(`${url}?projectId=${this.project.Id}`, this.newEntity)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.URL)
      this.axios.put(`${url}?projectId=${this.project.Id}`, this.newEntity)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    insertTextToTemplate (text) {
      this.$refs.editor.insertText(`[${text}]`)
    },
    updateTemplate () {
      this.newEntity = { ...this.entity }
      this.update()
    },
    del () {
      this.newEntity = { ...this.entity }
      this.$confirm(`确认要彻底删除${this.newEntity.Name}?删除后不可恢复`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.BATCH_DELETE)
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
    addChild () {
      this.isAdd = true
      this.newEntity = { ParentId: this.entity.Id, Name: '', Type: 1000, Remark: '' }
      this.drawerVisiable = true
    },
    updateChild (data, index) {
      this.isAdd = false
      this.newEntity = { ...data }
      this.drawerVisiable = true
    },
    delChild (data, index) {
      this.newEntity = { ...data }
      this.$confirm(`确认要彻底删除${this.newEntity.Name}?删除后不可恢复`, '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.BATCH_DELETE)
        this.axios.patch(`${url}?projectId=${this.project.Id}`, [this.newEntity.Id]).then(response => {
          if (response.Status) {
            this.get()
          }
        })
      })
    },
    entitySelectionChange (selections) {
      this.entitySelectionList = selections
    },
    getRecords () {
      this.loadingRecord = true
      const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.RECORD)
      this.axios.get(`${url}?projectId=${this.project.Id}`).then(response => {
        this.recordList = response
        this.loadingRecord = false
      })
    },
    buildCode () {
      const url = this.$root.getApi(API.KEY, API.CODE_STRUCTURE.CREADE_CODE)
      const ids = this.entitySelectionList.map(m => m.Id)
      this.axios.post(`${url}?projectId=${this.project.Id}`, { Ids: ids }).then(response => {
        if (response.Status) {
          this.getRecords()
        }
      })
      this.entityDialogVisiable = false
    },
    downloadFile (record) {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', (this.domain + record.Url), true)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        if (xhr.status === 200) {
          const blob = xhr.response
          const a = document.createElement('a')
          a.style.display = 'none'
          const url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = '代码文件.zip'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      }
      xhr.send()
    }
  },
  created () {
    this.init()
  },
  components: { CodeStructureCascader, CodeStructureEditor }
}
</script>

<style lang="scss" scoped>
.container {
  background: #fff;
}
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

  .child-table-box,
  .template-box,
  .build-box {
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
