import ArtalkConfig from "~/types/artalk-config";

const defaults: ArtalkConfig = {
  el: '',
  pageKey: '',
  server: '',
  site: '',

  placeholder: '键入内容...',
  noComment: '「此时无声胜有声」',
  sendBtn: '发送评论',
  darkMode: 'auto',
  editorTravel: true,

  flatMode: 'auto',
  nestMax: 2,
  nestSort: 'DATE_ASC',

  emoticons: "https://cdn.jsdelivr.net/gh/ArtalkJS/Emoticons/grps/default.json",

  vote: true,
  voteDown: false,
  uaBadge: true,
  listSort: true,
  pvEl: '#ArtalkPV',

  gravatar: {
    default: 'mp',
    mirror: 'https://sdn.geekzu.org/avatar/',
  },

  pagination: {
    pageSize: 20,
    readMore: true,
    autoLoad: true,
  },

  heightLimit: {
    content: 300,
    children: 400,
  },

  imgUpload: true,
  reqTimeout: 15000,
  versionCheck: true,
  useBackendConf: false,
}

export default defaults
