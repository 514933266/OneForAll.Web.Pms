// 任务状态
export const TASK_STATUS = [
  { value: 0, label: '未开始' },
  { value: 1, label: '进行中' },
  { value: 2, label: '暂停中' },
  { value: 3, label: '已完成' }
]

// 任务状态（具体到每个人）
export const TASK_MEMBER_STATUS = [
  { value: 0, label: '未开始' },
  { value: 1, label: '进行中' },
  { value: 2, label: '暂停中' },
  { value: 3, label: '已完成' }
]

// Bug类型
export const BUG_TYPE = [
  { value: 0, label: '代码错误' },
  { value: 1, label: '前端样式' },
  { value: 2, label: '设计缺陷' },
  { value: 3, label: '性能优化' },
  { value: 3, label: '安全相关' }
]

// Bug等级
export const BUG_LEVEL = [
  { value: 0, label: '轻微' },
  { value: 1, label: '中等' },
  { value: 2, label: '严重' },
  { value: 3, label: '致命' }
]

// Bug状态
export const BUG_STATUS = [
  { value: 0, label: '未解决' },
  { value: 1, label: '已解决' },
  { value: 2, label: '已关闭' }
]
export const MILESTONE_STATUS = [
  { value: 0, label: '未达成' },
  { value: 1, label: '已达成' },
  { value: 2, label: '已关闭' }
]
export const RISK_STATUS = [
  { value: 0, label: '未解决' },
  { value: 1, label: '已解决' },
  { value: 2, label: '已关闭' }
]
export const RISK_PRIORITY = [
  { value: 0, label: '可忽略' },
  { value: 1, label: '普通' },
  { value: 2, label: '一般' },
  { value: 2, label: '严重' }
]
export const FUNCTION_MATCH_LEVEL = [
  { value: 0, label: '低', remark: '有用例或功能相对简单' },
  { value: 1, label: '中', remark: '有用例但需要修改' },
  { value: 2, label: '高', remark: '没有任何用例且逻辑复杂' }
]
export const FUNCTION_ENABLE = [
  { value: false, label: '不计入' },
  { value: true, label: '计入' }
]
export const FUNCTION_TYPE = [
  { value: 0, label: 'EQ', remark: '外部查询' },
  { value: 1, label: 'EO', remark: '外部输出' },
  { value: 2, label: 'EI', remark: '外部输入' },
  { value: 3, label: 'ILF', remark: '内部逻辑文件' },
  { value: 4, label: 'EIF', remark: '外部接口文件' }
]

// 代码生成器结构类型
export const CODE_STRUCTURE_TYPE = [
  { value: 1000, label: '目录', icon: 'folder', canAddChild: true, canUpdTemplate: false, canBuildCode: false },
  { value: 1001, label: '实体目录', icon: 'folder', canAddChild: true, canUpdTemplate: false, canBuildCode: false },
  { value: 2000, label: '文件', icon: 'file', canAddChild: false, canUpdTemplate: true, canBuildCode: false },
  { value: 2001, label: '实体文件', icon: 'file-alt', canAddChild: false, canUpdTemplate: true, canBuildCode: false }
]
