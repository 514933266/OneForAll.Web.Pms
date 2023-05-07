<template>
  <el-input v-model="text" :autosize="{ minRows: 40, maxRows: 40}" :placeholder="placeholder" @blur="textBlur" ref="editor" type="textarea" style="margin-top: 10px;"></el-input>
</template>

<script>
import API from '../../../apis/pms-api'

export default {
  name: 'PmsCodeStructureEditor',
  props: {
    // 绑定值
    value: {
      type: String
    },
    // 水印
    placeholder: {
      type: String,
      default: '在此填写代码模板'
    }
  },
  data () {
    return {
      text: '', // 文本内容
      blurIndex: 0 // 光标位置
    }
  },
  computed: {
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  watch: {
    value (newValue) {
      this.text = newValue
    },
    text (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    textBlur (e) {
      this.blurIndex = e.srcElement.selectionStart
    },
    insertText (text) {
      const str = this.text
      this.text = str.slice(0, this.blurIndex) + text + str.slice(this.blurIndex)
    }
  }
}
</script>
