# 正则表达式测试器 (Regex Tester)

一个纯前端的正则表达式可视化测试工具，实时匹配高亮、分组捕获展示、常用预设一键填入。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器访问
# http://localhost:3001
```

构建生产版本：

```bash
npm run build
```

## 功能特性

- **双输入框**：上方正则表达式输入框（支持 `/pattern/flags` 格式或直接写 pattern），下方大文本区输入待测试内容
- **实时高亮匹配**：输入即匹配，命中内容用 `<mark>` 高亮标注，支持多行文本换行保留
- **分组捕获展示**：正则中含有捕获组 `(...)` 时，匹配结果区单独列出每个 Group 的内容
- **6 个常用正则预设**：邮箱、手机号、URL、身份证号、IP 地址、日期 (YYYY-MM-DD)，点按钮自动填入
- **语法错误提示**：正则语法非法时，输入框下方显示红色错误信息，不崩溃
- **匹配计数**：结果区右上角显示总匹配数量

## 技术栈

| 层 | 选型 |
|---|---|
| UI 框架 | **React 19** |
| 构建工具 | **webpack 5** + webpack-dev-server 5 |
| 转译 | **Babel 8**（@babel/preset-env、@babel/preset-react） |
| 正则引擎 | **JavaScript 原生 RegExp**（零额外依赖） |
| 样式 | 原生 CSS（flex + grid 响应式布局） |
| 测试 | 自研轻量 runner（零依赖，`node test/runner.js` 直接跑） |

纯前端应用，无后端、无网络请求、无需构建产物部署之外的任何服务。

## 目录结构

```
.
├── public/
│   └── index.html              # HTML 模板（HtmlWebpackPlugin 注入）
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # 顶层容器，管理全局 state + useMemo
│   │   ├── RegexInput.jsx      # 正则输入框 + 错误提示
│   │   ├── TestInput.jsx       # 测试文本 textarea
│   │   ├── MatchResult.jsx     # 匹配高亮 + 分组捕获 + 计数展示
│   │   └── PresetList.jsx      # 常用正则预设按钮组
│   ├── styles/
│   │   └── global.css          # 全局样式（布局、高亮、响应式）
│   ├── utils/
│   │   └── regex.js            # 核心纯函数：parseRegex / matchAll /
│   │                           #   highlightMatches / getGroupCount /
│   │                           #   formatRegexInput / PRESETS
│   ├── App.jsx                 # 根组件挂载 Layout
│   └── index.js                # webpack 入口，ReactDOM.createRoot
├── test/
│   ├── runner.js               # 轻量测试 runner（describe/it/expect）
│   └── regex.test.mjs          # 44 条用例，覆盖全部纯函数与预设
├── babel.config.js             # Babel 预设配置
├── webpack.config.js           # webpack 开发 + 生产配置
└── package.json
```

## 测试

```bash
npm test
```

运行 `test/` 目录下所有 `*.test.mjs`，零第三方依赖，纯 Node ESM。

当前覆盖模块（共 44 条用例，全部通过）：

| 模块 | 用例数 | 重点覆盖 |
|---|---|---|
| `parseRegex` | 9 | 纯字符串自动补 g flag、`/pattern/gi` 多 flag 解析、非法正则报错、空字符串/空白返回 null、URL 含 `//` 正确切分、`gimsuy` 全 flag 组合 |
| `matchAll` | 11 | 带 g 返回多匹配 + index 正确、无 g 只返回一个、零长度匹配不卡死（`\b`、`^` 多行边界）、空文本/无匹配/null 返回空数组、捕获 groups、g↔非g 切换无缓存 |
| `highlightMatches` | 9 | 正常匹配 highlighted=true、全文按顺序拼回原文、无匹配仅一个非高亮段、空文本/null/undefined 输入、含 `\n` 保留换行、乱序 matches 按 index 排序、全匹配单段 |
| `PRESETS` | 8 | 数量 ≥6、字段完整性、全部能 `new RegExp` 构造；邮箱/手机号/URL（含 `//`）/IP/日期 的实际匹配验证 |
| `getGroupCount` / `formatRegexInput` | 7 | 捕获组计数（含非捕获组 `(?:)` 不计）、格式化拼接 |

测试失败会以非零退出码结束，可直接接入 CI。

## License

ISC
