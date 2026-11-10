# Lemon PDF Studio（网页版）

纯本地运行的 PDF 工具箱。PDF 文件只在浏览器内存里处理，**不上传任何服务器**，也不依赖后端接口。

站点采用多页面（MPA）结构：首页、7 个工具页、帮助中心和法律页都有独立 URL，便于分享、搜索和广告投放。

## 功能

| 模块 | 能力 |
| --- | --- |
| 页面拆分 | 按页码范围 / 离散选页拆分，支持起止页预览 |
| 编辑精修 | 页面排序、删除、旋转、撤销重做；文字/图片水印；遮罩敏感内容 |
| 多文件合并 | PDF 与图片混合添加、拖拽排序、合并下载或送入编辑精修 |
| 图片转 PDF | 多张 JPG/PNG 排序后合成一个 PDF |
| PDF 转图片 | 72–600 DPI，PNG/JPEG，单张或拼接长图 |
| PDF 权限管理 | 移除你有权处理的 PDF 的权限限制或打开密码，保留文本层 |
| PDF 加密 | 设置打开密码、权限密码与打印/复制/修改等权限（AES-256） |

水印会实时显示在画布上，并自动包含在导出的 PDF 中；遮罩会作为黑色块烘焙进页面。

## 技术栈

- React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- `pdf-lib`：PDF 结构级编辑（拆分、合并、写回）
- `pdfjs-dist`：渲染、缩略图、文本检索
- `@libpdf/core`：PDF 加密与无损权限管理
- `jszip`：PDF 转图片的批量 ZIP
- 重计算放在 Web Worker（`src/workers/pdf.worker.ts`）中，避免阻塞界面

## 开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
```

## 构建与部署

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建产物 http://localhost:4173
```

`prebuild` 会自动：

1. 把 pdfjs 的 cmaps / standard_fonts / wasm / iccs / image_decoders 复制到 `public/pdfjs/`
2. 在设置了 `SITE_URL` 时生成 `public/sitemap.xml`

### 设置站点域名

`sitemap.xml` 需要绝对 URL。部署前设置环境变量再构建：

```bash
# Windows PowerShell
$env:SITE_URL="https://your-domain.com"; npm run build

# macOS / Linux
SITE_URL="https://your-domain.com" npm run build
```

也可以单独运行：

```bash
npm run sitemap
```

未设置 `SITE_URL` 时会跳过 sitemap 生成，不会阻塞构建。

### 静态托管

`dist/` 是纯静态文件：

- **Cloudflare Pages / Netlify / Vercel**：构建命令 `npm run build`，输出目录 `dist`
- **GitHub Pages**：把 `dist/` 推到 `gh-pages` 分支
- **Nginx**：`root /path/to/dist;`

`vite.config.ts` 中 `base: '/'`，默认部署在域名根路径。若部署到子路径（如 `example.com/pdf/`），需要把 `base` 改成 `/pdf/`，并同步调整 sitemap 与 canonical。

站点包含 `public/404.html`。Cloudflare Pages / Netlify 会自动使用它；Nginx 需要配置 `error_page 404 /404.html;`。

> ⚠️ 不要用 `file://` 直接双击 `dist/index.html`。浏览器会阻止 ES Module、Web Worker 以及 pdfjs 的 wasm / 字体 / cmaps 资源加载。必须通过 http(s) 访问。

## AdSense 与隐私合规

当前配置：

- `public/ads.txt` 已包含发布商 ID
- 8 个应用页均加载 AdSense Auto ads，并带 `google-adsense-account` meta
- `public/consent.js` 提供同意横幅，支持中/英/韩/日/德
- 所有页面在 AdSense 脚本之前设置 **Consent Mode 默认拒绝**；用户接受后才更新为 granted
- 隐私政策、服务条款、关于、联系、帮助中心均为独立静态页
- 法律页与 404 页不加载广告

### 还需要在 AdSense 后台完成

代码不能替代 Google 账号级配置：

1. **EEA/UK 的认证 CMP**：当前 `consent.js` 是自建同意横幅，不是 Google 认证 CMP。面向 EEA/UK 用户时，必须在 AdSense 后台接入 Funding Choices，或使用 Cookiebot / Usercentrics 等 Google 认证 CMP。否则个性化广告可能无法投放。
2. **Auto ads 密度**：建议只开启 In-page，关闭或谨慎使用 Anchor / Vignette；把工具操作区（上传、画布、导出按钮附近）排除，避免广告遮挡操作。
3. 在 AdSense 后台确认 `ads.txt` 状态为「已授权」。

### 隐私说明

- PDF 文件不上传；关闭或刷新页面即清空
- 页面会请求 Google AdSense 脚本，Google 可能设置广告 Cookie
- 语言偏好和同意选择保存在 `localStorage`（`lemon-pdf-locale`、`lemon-consent`）
- 详细说明见 `/privacy/`

## SEO

- 每个应用页有独立 title、description、canonical、Open Graph
- `public/robots.txt` 允许抓取
- `public/sitemap.xml` 由 `SITE_URL` 生成
- `public/help/` 提供 FAQ 与操作指南，作为主要内容入口
- `public/404.html` 为 noindex 404 页

**未实现**：语言独立 URL 与 hreflang。当前 5 种语言共用同一 URL，由客户端切换；要做多语言 SEO，需要把 `/en/`、`/de/` 等路径拆成独立入口，属于后续架构改造。

## 目录结构

```
src/
  components/   首页、顶栏、页脚、7 个工具页、缩略图、密码弹窗
  hooks/        usePDFState（文档状态机）
  i18n/         5 语言文案、指南、Provider
  utils/        pdfjs 配置、渲染、检索、权限管理、水印、handoff
  workers/      pdf.worker.ts（导出 / 合成等重活）
  types/        Tab 定义与共享类型
public/
  privacy/ terms/ about/ contact/ help/   静态内容页
  consent.js    同意横幅
  site-pages.css
  ads.txt robots.txt sitemap.xml 404.html
scripts/
  copy-pdfjs-assets.mjs
  generate-sitemap.mjs
```

## 已知限制

- 大文件受浏览器内存限制（通常几百 MB 量级）
- PDF 权限管理优先使用无损方式；极少数不支持的加密格式会回退到 pdfjs 逐页光栅重建，此时会丢失文本层
- PDF 权限是阅读器层面的建议性限制，不是 DRM；请只处理你拥有或已获授权处理的文件
- 页面布局按桌面设计，移动端可用但未做专门适配
- Auto ads 的具体位置与数量由 Google 决定，代码无法精确控制