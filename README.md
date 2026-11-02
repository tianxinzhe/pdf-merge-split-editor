# Lemon PDF Studio（网页版）

纯本地运行的 PDF 工具箱。所有文件都在浏览器内存里处理，**不上传任何服务器**，也不依赖后端接口。

## 功能

| 模块 | 能力 |
| --- | --- |
| 拆分 | 按页码范围 / 每页拆分 / 可视化选页，支持整页导出与批量 ZIP |
| 合并 | 多文件拖拽排序合并，支持图片（自动转 PDF 页） |
| 编辑 | 页面旋转、删除、重排、拖拽缩略图、导出 |
| 签名 | 手写/图片签名盖到指定位置 |
| 工具箱 | 加水印（文字/平铺）、涂黑遮盖（Redact）、加密、解除所有者密码、PDF ↔ 图片 |
| 加密 / 解密 | 用户密码加密；所有者密码限制解除（逐页渲染重建） |

## 技术栈

- React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- `pdf-lib`：PDF 结构级编辑（合并、拆分、加密、写回）
- `pdfjs-dist`：渲染、文本检索、解密重建
- 重计算全部放在 Web Worker（`src/workers/pdf.worker.ts`）里，避免卡界面

## 开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # 类型检查
npm run lint
```

## 构建与部署

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建产物 http://localhost:4173
```

`dist/` 是纯静态文件，可直接丢给任意静态托管：

- **Cloudflare Pages / Netlify / Vercel**：构建命令 `npm run build`，输出目录 `dist`
- **GitHub Pages**：把 `dist/` 推到 `gh-pages` 分支即可
- **Nginx**：`root /path/to/dist;`

`vite.config.ts` 里 `base: './'`，因此部署在任意子路径（如 `example.com/pdf/`）都能正常加载资源。

> ⚠️ 不要用 `file://` 直接双击 `dist/index.html` 打开。浏览器会阻止 ES Module、Web Worker 以及 pdfjs 的 wasm / 字体 / cmaps 资源加载，页面会白屏或无响应。必须通过 http(s) 访问——本机用 `npm run preview` 也行。

## 浏览器要求

- Chrome / Edge 90+（推荐）
- Firefox / Safari 新版本可用（不具备后续可选的 File System Access 原地保存能力）

## 隐私

- 无后端、无埋点、无网络请求（构建产物中的资源均为同源静态文件）
- 文件通过 `<input type="file">` / 拖拽进入页面后，只在当前标签页内存中处理
- 关闭或刷新页面即清空，没有任何持久化存储

## 目录结构

```
src/
  components/   界面：拆分、合并、编辑、工具箱、缩略图、密码弹窗
  hooks/        usePDFState（文档状态机）、useWorker（Worker 通信）
  utils/        pdfjs 配置、渲染、检索、解锁、水印、坐标换算
  workers/      pdf.worker.ts（导出 / 合成等重活）
  types/        Tab 定义与共享类型
public/         favicon、图标
```

## 与浏览器扩展版的差异

网页版去掉的是扩展外壳（`manifest.json`、`background.ts`、扩展打包脚本），PDF 处理代码完全一致。因此：

- ✅ 功能对等，无需安装、可分享链接、跨平台
- ❌ 不能拦截页面里的 PDF 链接、不能双击 PDF 用本工具打开、不能直接按本地路径读取文件（需用户手动选择文件）

## 已知限制

- 大文件受浏览器内存限制（通常几百 MB 量级）
- 解除所有者密码采用「逐页渲染成图后重建」，会丢失文本层，且比较吃 CPU
- 页面布局按桌面设计，移动端可用但未做专门适配