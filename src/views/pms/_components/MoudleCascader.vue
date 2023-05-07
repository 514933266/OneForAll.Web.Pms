<template>
  <el-cascader :props="{ checkStrictly: true, label: 'Title', children: 'Children', value: 'Id' }" v-model="treePath" :options="tree"
    :placeholder="placeholder"></el-cascader>
</template>

<script>
import API from '../../../apis/pms-api'

export default {
  name: 'MoudleCascader',
  props: {
    project: {
      type: Object
    },
    value: {
      type: String
    },
    placeholder: {
      type: String,
      default: '请选择上级模块'
    },
    hiddenKey: {
      type: String,
      default: ''
    },
    showRoot: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tree: [],
      treePath: [],
      rootItem: {
        Id: this.$store.state.guid,
        ParentId: this.$store.state.guid,
        Title: '根节点'
      }
    }
  },
  watch: {
    value (newValue) {
      this.init()
    },
    treePath (newValue) {
      const index = newValue.length - 1
      this.$emit('input', newValue[index])
    }
  },
  methods: {
    init () {
      this.get()
    },
    get () {
      const url = API.PROJECT.PROJECT_MOUDLE.replace(/{id}/, this.project.Id)
      this.axios.get(url).then(response => {
        this.setTree(response)
        this.treePath = this.getTreePath(this.value)
      })
    },
    setTree (tree) {
      if (this.hiddenKey) tree = this.hiddenNode(tree)
      if (this.showRoot) {
        tree.unshift(this.rootItem)
      }
      this.tree = tree
    },
    hiddenNode (source) {
      const index = source.findIndex(w => w.Id === this.hiddenKey)
      if (index > -1) {
        source.splice(index, 1)
      } else {
        source.forEach(e => {
          if (e.Children) e.Children = this.hiddenNode(e.Children)
        })
      }
      return source
    },
    getTreePath (value) {
      let result = [value]
      const option = this.findOption(this.tree, value)
      if (option && option.ParentId !== this.$store.state.guid) {
        result = this.getTreePath(option.ParentId).concat(result)
      }
      return result
    },
    findOption (source, value) {
      if (source) {
        for (let i = 0; i < source.length; i++) {
          const e = source[i]
          if (e.Id === value) {
            return e
          } else {
            const option = this.findOption(e.Children, value)
            if (option) return option
          }
        }
      }
      return null
    }
  },
  created () {
    this.init()
  }
}
</script>
