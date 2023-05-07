const API = {
  KEY: 'OneForAll.Pms',
  // 项目
  PROJECT: {
    URL: '/api/PmsProjects',
    STAR: '/api/PmsProjects/{id}/Star',
    MEMBER_STATISTICS: '/api/PmsProjects/{id}/Members/TaskStatistic'
  },
  // 项目需求
  REQUIREMENT: {
    URL: '/api/PmsRequirements',
    DELETE: '/api/PmsRequirements/Batch/IsDeleted',
    IMAGES: '/api/PmsRequirements/{id}/Images',
    RECORD: '/api/PmsRequirements/{id}/Records'
  },
  // 项目成员
  MEMBER: {
    URL: '/api/PmsMembers',
    DELETE: '/api/PmsMembers/{id}',
    ACCOUNT: '/api/PmsMembers/{id}/Account'
  },
  // 项目任务
  TASK: {
    URL: '/api/PmsTasks',
    DELETE: '/api/PmsTasks/Batch/IsDeleted',
    IMAGES: '/api/PmsTasks/{id}/Images',
    FILE: '/api/PmsTasks/{id}/Files',
    DETAILS: '/api/PmsTasks/{id}/Details'
  },
  // 项目Bug
  BUG: {
    URL: '/api/PmsBugs',
    DELETE: '/api/PmsBugs/Batch/IsDeleted'
  },
  // 项目里程碑
  MILESTONE: {
    URL: '/api/PmsMilestones',
    DELETE: '/api/PmsMilestones/Batch/IsDeleted'
  },
  // 项目风险
  RISK: {
    URL: '/api/PmsRisks',
    DELETE: '/api/PmsRisks/Batch/IsDeleted'
  },
  // 团队成员
  TEAM_MEMBER: {
    URL: '/api/PmsTeamMembers',
    DELETE: '/api/PmsTeamMembers/Batch/IsDeleted',
    ACCOUNT: '/api/PmsTeamMembers/{id}/Account'
  },
  // 项目分析
  DASHBOARD: {
    URL: 'api/Dashboards/Projects/Mine'
  },
  // 个人参与的
  PERSONAL: {
    PROJECT: '/api/PmsPersonal/Projects',
    PROJECT_TASK: '/api/PmsPersonal/Projects/{id}/Tasks',
    PROJECT_REQUIREMENT: '/api/PmsPersonal/Projects/{id}/Requirements',
    PROJECT_REQUIREMENT_RECORD: '/api/PmsPersonal/Projects/{id}/Requirements/{requirementId}/Records',
    PROJECT_BUG: '/api/PmsPersonal/Projects/{id}/Bugs',
    PROJECT_BUG_STATUS: '/api/PmsPersonal/Projects/{id}/Bugs/{bugId}/Status',
    PROJECT_MILESTONE: '/api/PmsPersonal/Projects/{id}/Milestones',
    PROJECT_MEMBER: '/api/PmsPersonal/Projects/{id}/Members'
  },
  // 代码生成器
  CODE_STRUCTURE: {
    URL: '/api/PmsCodeStructures',
    BATCH_DELETE: '/api/PmsCodeStructures/Batch/IsDeleted',
    CHILDREN: '/api/PmsCodeStructures/{id}/Children',
    CREADE_CODE: '/api/PmsCodeStructures/Current/Files',
    RECORD: '/api/PmsCodeStructures/Current/Records'
  },
  // 表实体
  ENTITY_TABLE: {
    URL: '/api/PmsEntityTables',
    BATCH_DELETE: '/api/PmsEntityTables/Batch/IsDeleted',
    FIELD: '/api/PmsEntityTables/{id}/FieldJson',
    CONTACT: '/api/PmsEntityTables/{id}/Contacts'
  },
  // 数据库连接字符串
  CONNECTION_STRING: {
    URL: '/api/PmsDbConnectStrings'
  }
}

export default API
