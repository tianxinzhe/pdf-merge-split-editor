import type { HomeMessages, Locale, Messages } from './types'
import { internalMessages } from './internal'

const zh: HomeMessages = {
  nav: {
    home: '首页',
    splitter: '页面拆分',
    editor: '编辑精修',
    merger: '多文件合并',
    toolbox: '工具箱',
  },
  common: {
    language: '语言',
    switchLanguage: '切换语言',
    backHome: '返回首页',
    appTitle: 'Lemon PDF Studio · 纯本地 PDF 工具箱',
  },
  home: {
    badge: '100% 本地处理 · 文件不上传服务器',
    titleLead: 'PDF 的琐事，',
    titleHighlight: '一次做完',
    subtitle:
      '拆分、合并、加水印、遮挡敏感内容、转图片、解除密码限制——全部在浏览器里完成。文件不会离开你的设备，也不需要注册账号。',
    ctaPrimary: '开始拆分 PDF',
    ctaSecondary: '浏览全部功能',
    stats: [
      { value: '4 个', label: '功能模块' },
      { value: '0 次', label: '文件上传' },
      { value: 'PDF / PNG / JPG', label: '支持格式' },
      { value: '无需登录', label: '打开即用' },
    ],
    modulesTitle: '每个模块能做什么',
    modulesSubtitle: '按任务进入对应模块，也可以随时从顶部导航切换。',
    modules: {
      splitter: {
        title: '页面拆分',
        tagline: '按范围或散页，精准取出你要的页面',
        description:
          '打开一份 PDF，用起止页预览确认边界，或直接在缩略图上点选多个页面，导出成一份新的 PDF。',
        features: [
          '范围区间：起止页可视化预览，中间页自动略过',
          '离散多选：点选缩略图，或输入 3, 15, 88',
          '导出前可更换源文件，随时关闭重来',
        ],
        cta: '进入页面拆分 →',
      },
      editor: {
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
        cta: '进入编辑精修 →',
      },
      merger: {
        title: '多文件合并',
        tagline: 'PDF 和图片混排，像乐高一样拼接',
        description:
          '把多份 PDF、PNG、JPG 一起拖进来，调整顺序后合并成一份文件；也可以合并后直接送入编辑精修继续加工。',
        features: [
          'PDF 与图片混合添加，支持拖拽上传',
          '拖拽调整文件顺序，显示文件类型与体积',
          '一键合并下载，或直接送入编辑精修',
        ],
        cta: '进入多文件合并 →',
      },
      toolbox: {
        title: '工具箱',
        tagline: '转图片、解密码，零散需求一次解决',
        description:
          '把 PDF 按指定清晰度导出为图片，或移除 PDF 的权限锁和打开密码；所有操作都在本地完成。',
        features: [
          'PDF 转图片：72–600 DPI，PNG / JPEG',
          '单张导出，或将全部页面拼接成长图',
          'Owner Lock 权限解放 / User Lock 打开密码移除',
        ],
        cta: '进入工具箱 →',
      },
    },
    steps: [
      { no: '01', title: '选择文件', description: '拖入或点选 PDF、PNG、JPG' },
      { no: '02', title: '调整处理', description: '选页、排序、加水印或遮挡' },
      { no: '03', title: '导出结果', description: '直接下载，文件不经过服务器' },
    ],
    privacyTitle: '为什么可以放心用？',
    privacySubtitle:
      '没有后端服务器，没有上传接口，所有解析、渲染和导出都在当前浏览器标签页内完成。',
    privacy: [
      {
        icon: '🔒',
        title: '文件不上传',
        description: 'PDF 只在内存中处理，关闭页面后即释放。',
      },
      {
        icon: '🚫',
        title: '无账号无追踪',
        description: '不需要登录，不收集文件内容和使用记录。',
      },
      {
        icon: '⚡',
        title: '打开即用',
        description: '常用 PDF 操作集中在一个界面，无需安装软件。',
      },
    ],
    footerBrand: '🍋 Lemon PDF Studio · 纯前端 PDF 工具箱',
    footerNote: '基于 pdf-lib 与 pdf.js · 文件始终留在本地',
  },
}

const en: HomeMessages = {
  nav: {
    home: 'Home',
    splitter: 'Page Splitter',
    editor: 'Editor',
    merger: 'Merge Files',
    toolbox: 'Toolbox',
  },
  common: {
    language: 'Language',
    switchLanguage: 'Switch language',
    backHome: 'Back to home',
    appTitle: 'Lemon PDF Studio · Browser-only PDF toolbox',
  },
  home: {
    badge: '100% local · files never leave your device',
    titleLead: 'Every PDF chore, ',
    titleHighlight: 'done in one place',
    subtitle:
      'Split, merge, add watermarks, redact sensitive details, convert to images and remove password restrictions — all inside your browser. Files stay on your device, and no account is needed.',
    ctaPrimary: 'Start splitting PDFs',
    ctaSecondary: 'Explore all features',
    stats: [
      { value: '4', label: 'modules' },
      { value: '0', label: 'file uploads' },
      { value: 'PDF / PNG / JPG', label: 'formats' },
      { value: 'No sign-up', label: 'ready to use' },
    ],
    modulesTitle: 'What each module does',
    modulesSubtitle: 'Jump into the module that fits your task, or switch anytime from the top bar.',
    modules: {
      splitter: {
        title: 'Page Splitter',
        tagline: 'Pull out exactly the pages you need, by range or by picking them.',
        description:
          'Open a PDF, confirm the boundaries with a start/end preview, or select pages directly from the thumbnails and export them as a new PDF.',
        features: [
          'Page ranges: visual start/end preview, intermediate pages skipped automatically',
          'Pick individual pages from thumbnails, or type 3, 15, 88',
          'Swap the source file before exporting, or close and start over anytime',
        ],
        cta: 'Open Page Splitter →',
      },
      editor: {
        title: 'Editor',
        tagline: 'Reorder, rotate, watermark and redact on one screen.',
        description:
          'Rearrange pages like cards, delete or rotate single pages, mark documents with live watermarks, cover sensitive details with redactions, then export a clean PDF.',
        features: [
          'Reorder, delete and rotate pages, with undo and redo',
          'Text or image watermarks: tile / single, font size, opacity, rotation, color, page range',
          'Watermarks appear live on the canvas and are included in exports automatically',
          'Drag redaction boxes over sensitive content and bake them into the page on export',
        ],
        cta: 'Open Editor →',
      },
      merger: {
        title: 'Merge Files',
        tagline: 'Mix PDFs and images, snap them together like Lego.',
        description:
          'Drag in multiple PDFs, PNGs and JPGs, arrange the order and merge them into one file — or send the result straight to the editor for further work.',
        features: [
          'Add PDFs and images together, with drag-and-drop upload',
          'Drag to reorder files, with type and size shown',
          'Merge and download in one click, or send straight to the editor',
        ],
        cta: 'Open Merge Files →',
      },
      toolbox: {
        title: 'Toolbox',
        tagline: 'Convert to images, unlock PDFs — small tasks, solved.',
        description:
          'Export PDF pages as images at the resolution you choose, or remove owner restrictions and open passwords — all processed locally.',
        features: [
          'PDF to image: 72–600 DPI, PNG / JPEG',
          'Export individual pages or stitch all pages into one long image',
          'Remove owner restrictions / remove open passwords',
        ],
        cta: 'Open Toolbox →',
      },
    },
    steps: [
      { no: '01', title: 'Choose a file', description: 'Drag in or pick a PDF, PNG or JPG' },
      { no: '02', title: 'Adjust', description: 'Select pages, reorder, add watermarks or redactions' },
      { no: '03', title: 'Export', description: 'Download directly — files never touch a server' },
    ],
    privacyTitle: 'Why it is safe to use',
    privacySubtitle:
      'There is no backend server and no upload endpoint. Parsing, rendering and exporting all happen in this browser tab.',
    privacy: [
      {
        icon: '🔒',
        title: 'Files stay on your device',
        description: 'PDFs are processed in memory and released when you close the page.',
      },
      {
        icon: '🚫',
        title: 'No accounts, no tracking',
        description: 'No sign-in, and we never collect file contents or usage history.',
      },
      {
        icon: '⚡',
        title: 'Ready when you are',
        description: 'Common PDF tools in one interface, with nothing to install.',
      },
    ],
    footerBrand: '🍋 Lemon PDF Studio · Browser-only PDF toolbox',
    footerNote: 'Built with pdf-lib and pdf.js · Files always stay local',
  },
}

const ko: HomeMessages = {
  nav: {
    home: '홈',
    splitter: '페이지 분할',
    editor: '편집',
    merger: '파일 병합',
    toolbox: '도구 상자',
  },
  common: {
    language: '언어',
    switchLanguage: '언어 변경',
    backHome: '홈으로 돌아가기',
    appTitle: 'Lemon PDF Studio · 브라우저 전용 PDF 도구',
  },
  home: {
    badge: '100% 로컬 처리 · 파일을 서버에 업로드하지 않음',
    titleLead: 'PDF 잡무, ',
    titleHighlight: '한 번에 끝내기',
    subtitle:
      '분할, 병합, 워터마크, 민감 정보 가리기, 이미지 변환, 암호 제한 해제까지 모두 브라우저에서 처리합니다. 파일은 기기를 떠나지 않으며 계정도 필요 없습니다.',
    ctaPrimary: 'PDF 분할 시작',
    ctaSecondary: '모든 기능 보기',
    stats: [
      { value: '4개', label: '기능 모듈' },
      { value: '0회', label: '파일 업로드' },
      { value: 'PDF / PNG / JPG', label: '지원 형식' },
      { value: '로그인 불필요', label: '바로 사용' },
    ],
    modulesTitle: '각 모듈에서 할 수 있는 일',
    modulesSubtitle: '작업에 맞는 모듈로 이동하거나 언제든 상단 내비게이션에서 전환하세요.',
    modules: {
      splitter: {
        title: '페이지 분할',
        tagline: '범위 또는 개별 페이지로 필요한 페이지만 정확히 추출',
        description:
          'PDF를 열고 시작/끝 페이지 미리보기로 범위를 확인하거나, 썸네일에서 여러 페이지를 직접 선택해 새 PDF로 내보내세요.',
        features: [
          '페이지 범위: 시작/끝 페이지를 미리 보고 중간 페이지는 자동으로 건너뜀',
          '개별 선택: 썸네일을 클릭하거나 3, 15, 88 입력',
          '내보내기 전에 원본 파일 교체, 언제든 닫고 다시 시작',
        ],
        cta: '페이지 분할 열기 →',
      },
      editor: {
        title: '편집',
        tagline: '정렬, 회전, 워터마크, 가림 처리를 한 화면에서.',
        description:
          '카드를 정리하듯 페이지 순서를 바꾸고, 페이지를 삭제하거나 회전하세요. 실시간 워터마크로 문서를 표시하고, 가림 영역으로 민감한 정보를 덮은 뒤 깔끔한 PDF로 내보냅니다.',
        features: [
          '페이지 정렬, 삭제, 회전 및 실행 취소/다시 실행',
          '텍스트 또는 이미지 워터마크: 타일 / 단일, 글자 크기, 투명도, 회전, 색상, 페이지 범위',
          '워터마크가 캔버스에 실시간 표시되고 내보내기에 자동 포함',
          '민감한 내용 위로 가림 상자를 드래그하고 내보낼 때 페이지에 적용',
        ],
        cta: '편집 열기 →',
      },
      merger: {
        title: '파일 병합',
        tagline: 'PDF와 이미지를 레고처럼 조합',
        description:
          '여러 PDF, PNG, JPG를 한 번에 끌어다 놓고 순서를 조정해 하나의 파일로 합치세요. 합친 결과를 편집 화면으로 보내 계속 작업할 수도 있습니다.',
        features: [
          'PDF와 이미지를 함께 추가하고 드래그 앤 드롭으로 업로드',
          '드래그로 파일 순서 변경, 파일 형식과 용량 표시',
          '클릭 한 번으로 병합 다운로드, 또는 편집 화면으로 바로 전송',
        ],
        cta: '파일 병합 열기 →',
      },
      toolbox: {
        title: '도구 상자',
        tagline: '이미지 변환, 잠금 해제까지 한 번에.',
        description:
          'PDF를 원하는 해상도의 이미지로 내보내거나, PDF의 권한 제한과 열기 암호를 제거하세요. 모든 작업은 로컬에서 처리됩니다.',
        features: [
          'PDF → 이미지: 72–600 DPI, PNG / JPEG',
          '개별 페이지 내보내기 또는 모든 페이지를 하나의 긴 이미지로 연결',
          'Owner Lock 권한 해제 / User Lock 열기 암호 제거',
        ],
        cta: '도구 상자 열기 →',
      },
    },
    steps: [
      { no: '01', title: '파일 선택', description: 'PDF, PNG, JPG를 끌어다 놓거나 선택' },
      { no: '02', title: '작업 조정', description: '페이지 선택, 정렬, 워터마크 또는 가림 처리' },
      { no: '03', title: '결과 내보내기', description: '바로 다운로드, 파일은 서버를 거치지 않음' },
    ],
    privacyTitle: '안심하고 사용해도 되는 이유',
    privacySubtitle:
      '백엔드 서버도 업로드 API도 없습니다. 모든 분석, 렌더링, 내보내기는 현재 브라우저 탭 안에서 이루어집니다.',
    privacy: [
      {
        icon: '🔒',
        title: '파일은 업로드되지 않습니다',
        description: 'PDF는 메모리에서만 처리되며 페이지를 닫으면 해제됩니다.',
      },
      {
        icon: '🚫',
        title: '계정도 추적도 없습니다',
        description: '로그인이 필요 없고 파일 내용이나 사용 기록을 수집하지 않습니다.',
      },
      {
        icon: '⚡',
        title: '설치 없이 바로 사용',
        description: '자주 쓰는 PDF 작업을 한 화면에 모았습니다.',
      },
    ],
    footerBrand: '🍋 Lemon PDF Studio · 브라우저에서만 동작하는 PDF 도구',
    footerNote: 'pdf-lib 및 pdf.js 기반 · 파일은 항상 로컬에 유지',
  },
}

const ja: HomeMessages = {
  nav: {
    home: 'ホーム',
    splitter: 'ページ分割',
    editor: '編集',
    merger: 'ファイル結合',
    toolbox: 'ツールボックス',
  },
  common: {
    language: '言語',
    switchLanguage: '言語を切り替え',
    backHome: 'ホームに戻る',
    appTitle: 'Lemon PDF Studio · ブラウザだけで動く PDF ツール',
  },
  home: {
    badge: '100% ローカル処理 · ファイルはサーバーに送信されません',
    titleLead: 'PDF の面倒ごとを、',
    titleHighlight: '一度に完了',
    subtitle:
      '分割、結合、透かし、機密情報のマスキング、画像変換、パスワード制限の解除まで、すべてブラウザ内で完結。ファイルが端末から出ることはなく、アカウントも不要です。',
    ctaPrimary: 'PDF 分割をはじめる',
    ctaSecondary: 'すべての機能を見る',
    stats: [
      { value: '4 つ', label: '機能モジュール' },
      { value: '0 回', label: 'ファイル送信' },
      { value: 'PDF / PNG / JPG', label: '対応形式' },
      { value: 'ログイン不要', label: 'すぐ使える' },
    ],
    modulesTitle: '各モジュールでできること',
    modulesSubtitle: '目的に合ったモジュールへ移動。上部ナビゲーションからいつでも切り替えられます。',
    modules: {
      splitter: {
        title: 'ページ分割',
        tagline: '範囲指定でも個別選択でも、必要なページだけを正確に取り出し',
        description:
          'PDF を開き、開始・終了ページのプレビューで範囲を確認するか、サムネイルから複数ページを直接選んで新しい PDF として書き出します。',
        features: [
          '範囲指定：開始・終了ページをプレビューし、間のページは自動でスキップ',
          '個別選択：サムネイルをクリック、または 3, 15, 88 と入力',
          '書き出し前に元ファイルを差し替え、いつでも閉じてやり直し',
        ],
        cta: 'ページ分割を開く →',
      },
      editor: {
        title: '編集',
        tagline: '並べ替え、回転、透かし、マスキングを 1 画面で。',
        description:
          'カードを整理するようにページ順を変更し、ページの削除や回転も可能。リアルタイムの透かしで文書をマークし、マスキングで機密情報を隠して、きれいな PDF を書き出します。',
        features: [
          'ページの並べ替え・削除・回転、元に戻す／やり直しに対応',
          'テキスト／画像の透かし：タイル / 単一、文字サイズ、透明度、回転、色、ページ範囲',
          '透かしはキャンバスにリアルタイム表示され、書き出しにも自動で含まれる',
          '機密情報の上にマスキング枠をドラッグし、書き出し時にページへ反映',
        ],
        cta: '編集を開く →',
      },
      merger: {
        title: 'ファイル結合',
        tagline: 'PDF と画像をレゴのように組み合わせ',
        description:
          '複数の PDF、PNG、JPG をまとめてドラッグし、順番を整えて 1 つのファイルに結合。結合後そのまま編集画面へ送って加工できます。',
        features: [
          'PDF と画像をまとめて追加、ドラッグ＆ドロップに対応',
          'ドラッグでファイル順を変更、種類とサイズを表示',
          'ワンクリックで結合・ダウンロード、または編集画面へ送信',
        ],
        cta: 'ファイル結合を開く →',
      },
      toolbox: {
        title: 'ツールボックス',
        tagline: '画像変換もロック解除も、これ一つで。',
        description:
          'PDF を指定した解像度の画像として書き出したり、PDF の権限ロックや開くためのパスワードを解除できます。すべてローカルで処理されます。',
        features: [
          'PDF → 画像：72–600 DPI、PNG / JPEG',
          '1 ページずつ書き出すか、全ページを 1 枚の長い画像に結合',
          'Owner Lock の権限解除 / User Lock の開くパスワード解除',
        ],
        cta: 'ツールボックスを開く →',
      },
    },
    steps: [
      { no: '01', title: 'ファイルを選択', description: 'PDF、PNG、JPG をドラッグまたは選択' },
      { no: '02', title: '調整', description: 'ページ選択、並べ替え、透かしやマスキング' },
      { no: '03', title: '書き出し', description: 'そのままダウンロード、ファイルはサーバーを通りません' },
    ],
    privacyTitle: '安心して使える理由',
    privacySubtitle:
      'バックエンドサーバーもアップロード API もありません。解析・描画・書き出しはすべて現在のブラウザタブ内で完結します。',
    privacy: [
      {
        icon: '🔒',
        title: 'ファイルはアップロードされません',
        description: 'PDF はメモリ上でのみ処理され、ページを閉じると解放されます。',
      },
      {
        icon: '🚫',
        title: 'アカウントも追跡もありません',
        description: 'ログイン不要で、ファイルの内容や利用履歴を収集しません。',
      },
      {
        icon: '⚡',
        title: 'すぐに使えます',
        description: 'よく使う PDF 操作を 1 つの画面に集約、インストール不要。',
      },
    ],
    footerBrand: '🍋 Lemon PDF Studio · ブラウザだけで動く PDF ツール',
    footerNote: 'pdf-lib と pdf.js を使用 · ファイルは常にローカルに',
  },
}

const de: HomeMessages = {
  nav: {
    home: 'Start',
    splitter: 'Seiten aufteilen',
    editor: 'Editor',
    merger: 'Dateien zusammenführen',
    toolbox: 'Werkzeugkasten',
  },
  common: {
    language: 'Sprache',
    switchLanguage: 'Sprache wechseln',
    backHome: 'Zurück zur Startseite',
    appTitle: 'Lemon PDF Studio · PDF-Toolbox für den Browser',
  },
  home: {
    badge: '100 % lokal · Dateien werden nicht hochgeladen',
    titleLead: 'PDF-Kram, ',
    titleHighlight: 'alles an einem Ort',
    subtitle:
      'Aufteilen, zusammenführen, Wasserzeichen setzen, sensible Inhalte schwärzen, in Bilder umwandeln und Passwortsperren entfernen — alles im Browser. Dateien bleiben auf deinem Gerät, ein Konto ist nicht nötig.',
    ctaPrimary: 'PDF jetzt aufteilen',
    ctaSecondary: 'Alle Funktionen ansehen',
    stats: [
      { value: '4', label: 'Module' },
      { value: '0', label: 'Uploads' },
      { value: 'PDF / PNG / JPG', label: 'Formate' },
      { value: 'Ohne Anmeldung', label: 'sofort einsatzbereit' },
    ],
    modulesTitle: 'Was die einzelnen Module können',
    modulesSubtitle:
      'Springe direkt in das passende Modul oder wechsle jederzeit über die obere Navigation.',
    modules: {
      splitter: {
        title: 'Seiten aufteilen',
        tagline: 'Genau die Seiten, die du brauchst – als Bereich oder einzeln ausgewählt.',
        description:
          'Öffne ein PDF, prüfe den Bereich mit der Start-/Endseiten-Vorschau oder wähle Seiten direkt in den Miniaturen aus und exportiere sie als neues PDF.',
        features: [
          'Seitenbereiche: visuelle Vorschau von Start und Ende, Seiten dazwischen werden automatisch übersprungen',
          'Einzelseiten: Miniaturen anklicken oder 3, 15, 88 eingeben',
          'Quelldatei vor dem Export wechseln oder jederzeit schließen und neu beginnen',
        ],
        cta: 'Seitenaufteilung öffnen →',
      },
      editor: {
        title: 'Editor',
        tagline: 'Sortieren, drehen, Wasserzeichen setzen und schwärzen – auf einem Bildschirm.',
        description:
          'Ordne Seiten wie Karten, lösche oder drehe einzelne Seiten, markiere Dokumente mit Live-Wasserzeichen, verdecke sensible Inhalte mit Schwärzungen und exportiere ein sauberes PDF.',
        features: [
          'Seiten sortieren, löschen und drehen, mit Rückgängig und Wiederholen',
          'Text- oder Bildwasserzeichen: gekachelt / einzeln, Schriftgröße, Deckkraft, Drehung, Farbe, Seitenbereich',
          'Wasserzeichen erscheinen live auf der Arbeitsfläche und werden automatisch exportiert',
          'Schwärzungsrahmen über sensible Inhalte ziehen – beim Export werden sie eingebrannt',
        ],
        cta: 'Editor öffnen →',
      },
      merger: {
        title: 'Dateien zusammenführen',
        tagline: 'PDFs und Bilder wie Lego kombinieren.',
        description:
          'Ziehe mehrere PDFs, PNGs und JPGs hinein, ordne sie und führe sie zu einer Datei zusammen – oder schicke das Ergebnis direkt in den Editor.',
        features: [
          'PDFs und Bilder gemeinsam hinzufügen, per Drag-and-drop',
          'Dateien per Drag-and-drop sortieren, Typ und Größe im Blick',
          'Mit einem Klick zusammenführen und herunterladen oder direkt in den Editor senden',
        ],
        cta: 'Dateien zusammenführen →',
      },
      toolbox: {
        title: 'Werkzeugkasten',
        tagline: 'Bilder erzeugen, Sperren lösen – alles an einem Ort.',
        description:
          'Exportiere PDF-Seiten in der gewünschten Auflösung als Bilder oder entferne Eigentümerbeschränkungen und Öffnungspasswörter – alles lokal.',
        features: [
          'PDF zu Bild: 72–600 DPI, PNG / JPEG',
          'Einzelne Seiten exportieren oder alle Seiten zu einem langen Bild zusammenfügen',
          'Owner-Lock-Beschränkungen entfernen / User-Lock-Passwort entfernen',
        ],
        cta: 'Werkzeugkasten öffnen →',
      },
    },
    steps: [
      { no: '01', title: 'Datei wählen', description: 'PDF, PNG oder JPG hineinziehen oder auswählen' },
      { no: '02', title: 'Anpassen', description: 'Seiten wählen, sortieren, Wasserzeichen oder Schwärzungen' },
      { no: '03', title: 'Exportieren', description: 'Direkt herunterladen – Dateien verlassen nie den Browser' },
    ],
    privacyTitle: 'Warum du es bedenkenlos nutzen kannst',
    privacySubtitle:
      'Es gibt keinen Backend-Server und keinen Upload-Endpunkt. Parsen, Rendern und Exportieren passieren vollständig in diesem Browser-Tab.',
    privacy: [
      {
        icon: '🔒',
        title: 'Dateien werden nicht hochgeladen',
        description: 'PDFs werden nur im Arbeitsspeicher verarbeitet und beim Schließen der Seite freigegeben.',
      },
      {
        icon: '🚫',
        title: 'Keine Konten, kein Tracking',
        description: 'Keine Anmeldung, und wir sammeln weder Dateiinhalte noch Nutzungsverläufe.',
      },
      {
        icon: '⚡',
        title: 'Sofort einsatzbereit',
        description: 'Die wichtigsten PDF-Werkzeuge in einer Oberfläche, ohne Installation.',
      },
    ],
    footerBrand: '🍋 Lemon PDF Studio · PDF-Werkzeuge nur im Browser',
    footerNote: 'Mit pdf-lib und pdf.js · Dateien bleiben immer bei dir',
  },
}

const baseMessages: Record<Locale, HomeMessages> = { zh, en, ko, ja, de }

export const messages: Record<Locale, Messages> = {
  zh: { ...baseMessages.zh, ...internalMessages.zh },
  en: { ...baseMessages.en, ...internalMessages.en },
  ko: { ...baseMessages.ko, ...internalMessages.ko },
  ja: { ...baseMessages.ja, ...internalMessages.ja },
  de: { ...baseMessages.de, ...internalMessages.de },
}