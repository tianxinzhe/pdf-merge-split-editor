import type { TabId } from '../types'

interface HomePageProps {
  onNavigate: (tab: TabId) => void
}

interface ModuleInfo {
  id: Exclude<TabId, 'home'>
  icon: string
  title: string
  tagline: string
  description: string
  features: string[]
  iconClass: string
  checkClass: string
  linkClass: string
}

const MODULES: ModuleInfo[] = [
  {
    id: 'splitter',
    icon: '✂️',
    title: '页面拆分',
    tagline: '按范围或散页，精准取出你要的页面',
    description:
      '打开一份 PDF，用起止页预览确认边界，或直接在缩略图上点选多个页面，导出成一份新的 PDF。',
    features: [
      '范围区间：起止页可视化预览，中间页自动略过',
      '离散多选：点选缩略图，或输入 3, 15, 88',
      '导出前可更换源文件，随时关闭重来',
    ],
    iconClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    checkClass: 'text-blue-400',
    linkClass: 'text-blue-400 hover:text-blue-300',
  },
  {
    id: 'editor',
    icon: '✍️',
    title: '编辑精修',
    tagline: '排序、旋转、水印、遮挡，一屏完成',
    description:
      '像整理卡片一样调整页面顺序，删除或旋转单页；用实时预览的水印标记文档，用遮罩盖住敏感信息，最后导出干净的 PDF。',
    features: [
      '页面排序、删除、旋转，支持撤销与重做',
      '文字或图片水印：平铺 / 单点、字号、透明度、旋转、颜色、页范围',
      '水印实时显示在画布上，并自动包含在导出结果中',
      '拖拽遮罩隐藏敏感内容，导出时烘焙进页面',
    ],
    iconClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    checkClass: 'text-violet-400',
    linkClass: 'text-violet-400 hover:text-violet-300',
  },
  {
    id: 'merger',
    icon: '📂',
    title: '多文件合并',
    tagline: 'PDF 和图片混排，像乐高一样拼接',
    description:
      '把多份 PDF、PNG、JPG 一起拖进来，调整顺序后合并成一份文件；也可以合并后直接送入编辑精修继续加工。',
    features: [
      'PDF 与图片混合添加，支持拖拽上传',
      '拖拽调整文件顺序，显示文件类型与体积',
      '一键合并下载，或直接送入编辑精修',
    ],
    iconClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    checkClass: 'text-emerald-400',
    linkClass: 'text-emerald-400 hover:text-emerald-300',
  },
  {
    id: 'toolbox',
    icon: '🧰',
    title: '工具箱',
    tagline: '转图片、解密码，零散需求一次解决',
    description:
      '把 PDF 按指定清晰度导出为图片，或移除 PDF 的权限锁和打开密码；所有操作都在本地完成。',
    features: [
      'PDF 转图片：72–600 DPI，PNG / JPEG',
      '单张导出，或将全部页面拼接成长图',
      'Owner Lock 权限解放 / User Lock 打开密码移除',
    ],
    iconClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    checkClass: 'text-amber-400',
    linkClass: 'text-amber-400 hover:text-amber-300',
  },
]

const STEPS = [
  { no: '01', title: '选择文件', desc: '拖入或点选 PDF、PNG、JPG' },
  { no: '02', title: '调整处理', desc: '选页、排序、加水印或遮挡' },
  { no: '03', title: '导出结果', desc: '直接下载，文件不经过服务器' },
]

export function HomePage({ onNavigate }: HomePageProps) {
  const scrollToModules = () => {
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-14 md:py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/80 border border-gray-700 text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            100% 本地处理 · 文件不上传服务器
          </span>

          <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            PDF 的琐事，<span className="text-blue-400">一次做完</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-400 leading-relaxed">
            拆分、合并、加水印、遮挡敏感内容、转图片、解除密码限制——全部在浏览器里完成。
            文件不会离开你的设备，也不需要注册账号。
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('splitter')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
            >
              开始拆分 PDF
            </button>
            <button
              onClick={scrollToModules}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-sm font-medium transition-colors cursor-pointer"
            >
              浏览全部功能
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              ['4 个', '功能模块'],
              ['0 次', '文件上传'],
              ['PDF / PNG / JPG', '支持格式'],
              ['无需登录', '打开即用'],
            ].map(([value, label]) => (
              <div key={label} className="px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="mt-0.5 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="max-w-5xl mx-auto px-6 py-12 scroll-mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">每个模块能做什么</h2>
            <p className="mt-1.5 text-sm text-gray-400">按任务进入对应模块，也可以随时从顶部导航切换。</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {MODULES.map(m => (
            <article
              key={m.id}
              className="flex flex-col p-6 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center text-xl ${m.iconClass}`}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{m.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{m.tagline}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-300 leading-relaxed">{m.description}</p>

              <ul className="mt-4 space-y-2">
                {m.features.map(feature => (
                  <li key={feature} className="flex gap-2 text-sm text-gray-400 leading-relaxed">
                    <span className={`mt-0.5 shrink-0 ${m.checkClass}`}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate(m.id)}
                className={`mt-auto pt-5 self-start text-sm font-medium transition-colors cursor-pointer ${m.linkClass}`}
              >
                进入{m.title} →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map(step => (
            <div key={step.no} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
              <span className="text-lg font-bold text-gray-600 tabular-nums">{step.no}</span>
              <div>
                <p className="text-sm font-medium text-white">{step.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-white">为什么可以放心用？</h2>
          <p className="mt-1.5 text-sm text-gray-400">
            没有后端服务器，没有上传接口，所有解析、渲染和导出都在当前浏览器标签页内完成。
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['🔒', '文件不上传', 'PDF 只在内存中处理，关闭页面后即释放。'],
              ['🚫', '无账号无追踪', '不需要登录，不收集文件内容和使用记录。'],
              ['⚡', '打开即用', '常用 PDF 操作集中在一个界面，无需安装软件。'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <div className="text-xl">{icon}</div>
                <p className="mt-2 text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span>🍋 Lemon PDF Studio · 纯前端 PDF 工具箱</span>
          <span>基于 pdf-lib 与 pdf.js · 文件始终留在本地</span>
        </div>
      </footer>
    </div>
  )
}