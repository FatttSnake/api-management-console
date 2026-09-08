<div align="center">
    <h1>
        <img alt="API Management Console" src="docs/logo.svg" width="140">
        <br>
        <span>API Management Console</span>
    </h1>
</div>
<div align="center">
    <b><a href="https://github.com/FatttSnake/api-management">API Management</a> 的网页控制台 —— 自助服务与平台管理界面</b>
</div>

# 概述 ([EN](README.md), 简体中文)

本项目是 [API Management](https://github.com/FatttSnake/api-management) 平台的前端网页控制台，将**终端用户自助门户**与**平台管理端**整合于同一个单页应用中，需配合后端 API 使用。

控制台使用 **React + TypeScript + Vite** 编写，界面基于 **Ant Design**。平台通过 REST API 暴露的能力几乎都能在浏览器中完成管理：账户与权限、插件与接口、API 密钥与计费、监控与统计以及系统设置等。

# 特性

- **账户与安全** —— 注册 / 登录 / 邮箱验证 / 忘记密码找回流程，支持可选的 **Cloudflare Turnstile** 人机验证与 **TOTP 双因素**绑定；JWT 令牌带 CSRF 保护并静默续期。
- **权限驱动的界面** —— 侧边栏菜单与路由按当前用户的 **RBAC** 权限树动态组装；每个操作以细粒度权限点鉴权，覆盖**用户 / 角色 / 群组**管理。
- **插件管理** —— 上传插件 Jar（带进度）并**热安装 / 启停 / 升级 / 卸载**；管理用于校验插件签名的 **Ed25519 信任公钥库**。
- **接口管理** —— 配置各插件提供的能力接口（启用开关、`need-key`、访问模式、单价、频控等）。
- **API 账户与密钥** —— 创建绑定可用 API（按插件分组）的 API Key，**重新生成密钥（仅显示一次）**，启停与设置有效期；查看账户余额。
- **运营管理** —— 检索 API 账户、**充值余额**，查看**账单流水**与任意账户的用量信息。
- **用户自助服务** —— 我的用量、我的 API Keys、我的账单与余额，以及个人档案页（随机头像、昵称、修改密码、双因素绑定/解绑、主题切换）。
- **监控与统计** —— 在线与活跃用量概况、软硬件环境信息、实时 CPU / 存储图表。
- **系统设置** —— 基础（系统名称、Turnstile 密钥、Token 续期缓冲与检查周期、主页 URL）、SMTP 邮件（内置测试发送）、敏感词过滤、双因素策略与 API 相关选项。
- **系统日志** —— 平台系统日志查看。
- **使用体验** —— 亮色 / 深色 / 跟随系统三种主题、可折叠的分组侧边栏。

# 技术栈

- **React 19** + **TypeScript**，使用 **Vite** 构建
- **Ant Design 6** + **antd-style** CSS-in-JS，搭配自定义 SVG 图标集（unplugin-icons + AutoImport）
- **react-router 8**（数据路由）实现权限感知的路由
- **axios** 请求拦截、令牌自动续期与统一错误处理
- **echarts** 渲染监控 / 统计图表
- **Cloudflare Turnstile** 人机验证（@marsidev/react-turnstile）
- **@noble/hashes**（SHA-512）密码散列、**jwt-decode** 令牌解析、**dayjs** 日期处理

# 项目结构

```
api-management-console/
├── docs/                                # 项目文档与素材（logo.svg）
├── public/
│   ├── config.json                      # 运行期配置（API 地址，见「配置」）
│   └── config.sample.json               # config.json 示例
├── src/
│   ├── App.tsx                          # 应用外壳：主题、路由、ConfigProvider、message/notification/modal
│   ├── AuthRoute.tsx                    # 路由守卫（登录 / 验证 / 权限 / 页面标题）
│   ├── routers/                         # 路由 JSON 定义
│   │   ├── index.tsx                    # 根路由（登录注册页 + 主框架）
│   │   ├── framework.tsx                # 区分自助区与系统区的框架
│   │   ├── user.tsx                     # 自助服务路由（用量、API Keys、账单、个人档案）
│   │   └── system.ts                    # 管理端路由（插件、接口、用户/角色/群组、日志、统计、设置等）
│   ├── pages/
│   │   ├── Sign/                        # 登录 / 注册 / 邮箱验证 / 忘记密码（Turnstile、双因素、OTP）
│   │   ├── Framework.tsx                # 分组侧边栏外壳（自助区 + 系统区）
│   │   ├── System/                      # 管理端页面（插件与信任密钥、接口、运营、统计、设置、密钥、用户/角色/群组、日志）
│   │   └── User/                        # 自助页面（用量、API Keys、账单、个人档案）
│   ├── components/
│   │   ├── common/                      # Sidebar、Captcha（Turnstile）、Permission 鉴权组件、Card、Scrollbar 等
│   │   ├── config/                      # 配置加载上下文（本地 config.json + 远端 {apiUrl}/config）
│   │   └── system/                      # SettingsCard 等共享管理端组件
│   ├── services/                        # Axios 封装：拦截器、静默续期、类型化 REST 请求
│   ├── hooks/                           # useTokenRefresh（定时刷新 JWT）
│   ├── constants/                       # 业务响应码与 REST 地址
│   ├── utils/                           # auth、crypto（SHA-512）、route 工具等
│   └── assets/                          # 全局样式与自定义 console SVG 图标
├── index.html                           # 入口 HTML（中文语言、favicon）
├── vite.config.ts                       # Vite + React + AutoImport + unplugin-icons
└── package.sh                           # 打包脚本（tar.gz / zip + 校验和）
```

# 关联项目

[API Management](https://github.com/FatttSnake/api-management)

[API Management Plugins](https://github.com/FatttSnake/api-management-plugins)

# 环境要求

- Node.js 与 npm（用于开发 / 构建）
- Web 服务器，如 Nginx / Apache httpd（用于部署）
- [API Management](https://github.com/FatttSnake/api-management) 后端服务

# 开发

```shell
npm install
npm run dev        # 启动开发服务器
npm run lint       # eslint
npm run format     # prettier
```

# 构建

```shell
npm run build              # vite build + typecheck → dist/
npm run build:package      # 构建并执行 package.sh
```

`build:package` 会产出 `api-management-console[-v<版本号>].tar.gz` 与 `.zip`，同时生成 `md5 / sha1 / sha256 / sha512` 校验文件。

# 部署

**1. 从 [Releases](https://github.com/FatttSnake/api-management-console/releases/latest) 页面下载最新打包的生产版本，或自行执行 `npm run build:package`**

**2. 将 `api-management-console-*.tar.gz`（或 `*.zip`）上传到 Web 服务器并解压**

**3. 将 `config.sample.json` 复制为 `config.json`，并填写 API 地址**

```shell
cp config.sample.json config.json
```

**4. 配置伪静态（history 模式路由）**

Nginx:

```nginx
server {
    ...

    index index.html

    location / {
        try_files $uri $uri/ /index.html;
    }

    ...
}
```

Apache httpd (.htaccess):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

# 配置

运行期配置从部署根目录的 `config.json` 读取，此处仅需配置后端 API 地址：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `apiUrl` | 是 | [API Management](https://github.com/FatttSnake/api-management) 后端的地址 |

```json
{
    "apiUrl": "https://api.example.com"
}
```

除 `config.json` 外，控制台还会向后端请求 `{apiUrl}/config` 以获取扩展参数 —— 系统名称、Turnstile 密钥、主页 URL 与 Token 续期时机。这些参数可在本控制台的 **系统设置 → 基础** 中维护。

# 许可证

[GPL-3.0](LICENSE)
