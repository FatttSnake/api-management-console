<div align="center">
    <h1>
        <img alt="API Management Console" src="docs/logo.svg" width="140">
        <br>
        <span>API Management Console</span>
    </h1>
</div>
<div align="center">
    <b>The web console of <a href="https://github.com/FatttSnake/api-management">API Management</a> — a self-service &amp; administration UI</b>
</div>
<div align="center">
    <a href="https://ci.fatweb.top/job/API%20Management%20Console/">
        <img alt="Build" src="https://ci.fatweb.top/job/API%20Management%20Console/badge/icon">
    </a>
    <a href="https://github.com/FatttSnake/api-management-console/releases/latest">
        <img alt="Release" src="https://img.shields.io/github/v/release/FatttSnake/api-management-console">
    </a>
    <a href="LICENSE">
        <img alt="LICENSE" src="https://img.shields.io/github/license/FatttSnake/api-management-console">
    </a>
</div>

# Overview ([简体中文](README_zh.md), EN)

This project is the front-end web console of the [API Management](https://github.com/FatttSnake/api-management) platform. It bundles the **end-user self-service portal** and the **platform administration console** into one single-page application, and needs to be used together with the backend API.

The console is written in **React + TypeScript + Vite** with **Ant Design**. Everything the platform exposes through its REST API is managed from the browser: accounts &amp; permissions, plugins &amp; interfaces, API keys &amp; billing, monitoring &amp; statistics and system settings.

# Features

- **Account & security** — register / login / email-verify / forgot-reset flows with optional **Cloudflare Turnstile** captcha; **TOTP two-factor** binding; JWT tokens silently refreshed with CSRF protection.
- **Permission-driven UI** — the sidebar and routes are dynamically assembled from the current user's RBAC permission tree; every operation is gated by a fine-grained permission code, covering **users / roles / groups**.
- **Plugin management** — upload plugin jars with progress and **hot install / enable-disable / upgrade / uninstall**; manage the **Ed25519 trust keys** used to verify plugin signatures.
- **Interface management** — configure every interface provided by the plugins (enable switch, `need-key`, access mode, price, rate limits, and more).
- **API accounts &amp; keys** — create API keys bound to the available APIs (grouped by plugin), **regenerate a secret key (shown only once)**, enable/disable and expire them; view account balance.
- **Operations** — search API accounts, **top up** balances, browse **billing / transactions** and the usage of any account.
- **Self-service zone** — my usage, my API keys, my billing &amp; balance, and a profile page (generated avatar, nickname, change password, bind/unbind 2FA, theme).
- **Monitoring & statistics** — online &amp; active usage overview, hardware &amp; software inventory, real-time CPU / storage charts.
- **System settings** — base (system name, Turnstile keys, token-refresh buffer &amp; check interval, home URL), SMTP mail (with a built-in test button), sensitive-word filter, 2FA policy and API options.
- **System logs** — a system log viewer for the platform.
- **Experience** — light / dark / follow-system themes, and a collapsible grouped sidebar.

# Tech Stack

- **React 19** + **TypeScript**, bundled by **Vite**
- **Ant Design 6** with **antd-style** CSS-in-JS and a custom SVG icon set (unplugin-icons + AutoImport)
- **react-router 8** (data router) for permission-aware routing
- **axios** with request interceptors, token auto-refresh and unified error handling
- **echarts** for monitoring / statistics charts
- **Cloudflare Turnstile** captcha (@marsidev/react-turnstile)
- **@noble/hashes** (SHA-512) for password hashing, **jwt-decode** for token inspection, **dayjs** for dates

# Project Structure

```
api-management-console/
├── docs/                                # Docs & assets (logo.svg)
├── public/
│   ├── config.json                      # Runtime config (API base URL, see Configuration)
│   └── config.sample.json               # Sample of config.json
├── src/
│   ├── App.tsx                          # App shell: theme, router, ConfigProvider, message/notification/modal
│   ├── AuthRoute.tsx                    # Route guard (login / verify / permissions / page title)
│   ├── routers/                         # Route JSON definitions
│   │   ├── index.tsx                    # Root routes (sign pages + framework)
│   │   ├── framework.tsx                # Framework splitting self-service zone & system zone
│   │   ├── user.tsx                     # Self-service routes (usage, API keys, billing, profile)
│   │   └── system.ts                    # Admin routes (plugin, interface, user/role/group, log, statistics, settings, …)
│   ├── pages/
│   │   ├── Sign/                        # Login / Register / Verify / Forget (Turnstile, 2FA, OTP)
│   │   ├── Framework.tsx                # Shell with the grouped sidebar (user zone + system zone)
│   │   ├── System/                      # Admin pages (plugin & trust keys, interface, operations, statistics, settings, keys, user/role/group, log)
│   │   └── User/                        # Self-service pages (usage, api keys, billing, profile)
│   ├── components/
│   │   ├── common/                      # Sidebar, Captcha (Turnstile), Permission gate, Card, Scrollbar, …
│   │   ├── config/                      # Config loading context (local config.json + remote {apiUrl}/config)
│   │   └── system/                      # SettingsCard & shared admin widgets
│   ├── services/                        # Axios wrapper: interceptors, silent token refresh, typed REST APIs
│   ├── hooks/                           # useTokenRefresh (scheduled JWT renewal)
│   ├── constants/                       # Business response codes & REST URLs
│   ├── utils/                           # auth, crypto (SHA-512), route helpers, …
│   └── assets/                          # Global styles & custom console SVG icons
├── index.html                           # Entry HTML (zh locale, favicon)
├── vite.config.ts                       # Vite + React + AutoImport + unplugin-icons
└── package.sh                           # Packaging script (tar.gz / zip + checksums)
```

# Related projects

[API Management](https://github.com/FatttSnake/api-management)

[API Management Plugins](https://github.com/FatttSnake/api-management-plugins)

# Requires

- Node.js & npm (for development / building)
- A web server, e.g. Nginx / Apache httpd (for deployment)
- The [API Management](https://github.com/FatttSnake/api-management) backend service

# Development

```shell
npm install
npm run dev        # start the dev server
npm run lint       # eslint
npm run format     # prettier
```

# Build

```shell
npm run build              # vite build + typecheck → dist/
npm run build:package      # build and run package.sh
```

`build:package` produces `api-management-console[-v<version>].tar.gz` and `.zip`, together with `md5 / sha1 / sha256 / sha512` checksum files.

# Deployment

**1. Download the latest packaged production build from the [Releases](https://github.com/FatttSnake/api-management-console/releases/latest) page, or run `npm run build:package` yourself**

**2. Upload `api-management-console-*.tar.gz` (or `*.zip`) to the web server and unzip it**

**3. Copy `config.sample.json` to `config.json` and fill in the API URL**

```shell
cp config.sample.json config.json
```

**4. Configure the SPA fallback (history-mode routing)**

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

# Configuration

Runtime configuration is read from `config.json` (in the deployment root). Only the backend API base URL is required here:

| Field | Required | Description |
| --- | --- | --- |
| `apiUrl` | Yes | Base URL of the [API Management](https://github.com/FatttSnake/api-management) backend |

```json
{
    "apiUrl": "https://api.example.com"
}
```

On top of `config.json`, the console fetches `{apiUrl}/config` from the backend for extended parameters — system name, Turnstile keys, home URL and token-refresh timings. Those are edited on the backend under **System Settings → Base** of this console.

# License

[GPL-3.0](LICENSE)
