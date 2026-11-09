import type { GuideCopy, GuideModuleId, Locale } from './types'

const zh: Record<GuideModuleId, GuideCopy> = {
  splitter: {
    title: '关于 PDF 拆分',
    intro: '拆分在浏览器本地完成，文件不会上传。适合提取章节、拆分扫描件，或把大文件切成便于分享的小文件。',
    tips: [
      '范围区间会包含起止页；需要不连续的页面时切换到「离散多选」。',
      '导出前可以预览起止页，确认内容无误再下载。',
      '拆分会保留原页面方向；加密文件请先在「PDF 解密」中解锁。',
    ],
  },
  editor: {
    title: '关于 PDF 编辑精修',
    intro: '可以排序、删除、旋转页面，添加文字或图片水印，并用遮罩隐藏敏感内容。所有修改只在本地进行。',
    tips: [
      '水印参数调整后会实时显示在画布上，并自动包含在导出的 PDF 中。',
      '拖拽缩略图可以调整页面顺序，Ctrl+Z 可以撤销操作。',
      '遮罩会以黑色块写入导出的 PDF，原文无法再恢复。',
    ],
  },
  merger: {
    title: '关于 PDF 合并',
    intro: '可以把多个 PDF、JPG、PNG 按顺序合并成一个文件。文件始终留在本地，适合整理合同、发票或扫描件。',
    tips: [
      'PDF 与图片可以混合添加，合并时按列表顺序拼接。',
      '拖拽列表可以调整顺序，合并前请确认页数。',
      '合并后可直接下载，或送入编辑精修继续处理。',
    ],
  },
  toolbox: {
    title: '关于 PDF 转图片',
    intro: 'PDF 转图片在浏览器本地完成，不会上传文件。',
    tips: [
      '屏幕查看选 150 DPI，打印或存档建议 300 DPI 以上。',
      '拼接长图适合聊天记录、网页长截图等连续内容。',
      '导出前可切换 PNG / JPEG，并按需选择单张或长图。',
    ],
  },
  img2pdf: {
    title: '关于图片转 PDF',
    intro: '把多张 JPG、PNG、WebP 图片按顺序合成一个 PDF，适合整理照片、扫描件和聊天截图。所有处理都在浏览器本地完成。',
    tips: [
      '图片会按列表顺序生成页面，拖拽可以调整顺序。',
      '每张图片保留原始宽高比，不会被拉伸或裁切。',
      '需要加水印、遮罩或旋转时，可以把结果送入编辑精修继续处理。',
    ],
  },
  unlock: {
    title: '关于 PDF 解密',
    intro: '用于移除你有权处理的 PDF 的权限限制或打开密码。文件只在浏览器内处理，不会上传到服务器。',
    tips: [
      '权限限制影响复制、打印和编辑；标准 PDF 会保留文本层，少数旧版加密文件会回退为逐页图像。',
      '打开密码需要你知道当前密码，本工具不会破解未知密码。',
      '请只处理你拥有或已获授权处理的文件，并遵守相关法律。',
    ],
  },
  encrypt: {
    title: '关于 PDF 加密',
    intro: '在发送合同、证件或财务文件前，为 PDF 添加打开密码和权限限制，增加一层保护。',
    tips: [
      '打开密码为必填项；权限密码可选，留空时由程序生成随机密码。',
      'AES-256 兼容性较好；权限限制属于 PDF 阅读器执行的建议性约束。',
      '请妥善保管密码，加密文件一旦忘记密码将无法恢复。',
    ],
  },
}

const en: Record<GuideModuleId, GuideCopy> = {
  splitter: {
    title: 'About splitting PDFs',
    intro: 'Splitting runs entirely in your browser; files are never uploaded. Use it to extract chapters, split scans, or break a large file into shareable parts.',
    tips: [
      'A page range includes both the start and end page. Switch to "Pick pages" for non-consecutive pages.',
      'Preview the first and last page before exporting to make sure the range is right.',
      'Page orientation is preserved. Unlock encrypted files in the Unlock PDF module first.',
    ],
  },
  editor: {
    title: 'About the PDF editor',
    intro: 'Reorder, delete and rotate pages, add text or image watermarks, and hide sensitive content with redactions. Everything stays on your device.',
    tips: [
      'Watermark changes appear on the canvas immediately and are included in the exported PDF.',
      'Drag thumbnails to change page order; press Ctrl+Z to undo.',
      'Redactions are burned into the exported PDF as black boxes and cannot be recovered.',
    ],
  },
  merger: {
    title: 'About merging PDFs',
    intro: 'Combine multiple PDFs, JPGs and PNGs into one file in the order you choose. Files remain local, ideal for contracts, invoices and scans.',
    tips: [
      'PDFs and images can be mixed; they are joined in list order.',
      'Drag the list to reorder items and check the page count before merging.',
      'Download the result directly or send it to the editor for further work.',
    ],
  },
  toolbox: {
    title: 'About PDF to Images',
    intro: 'PDF-to-image conversion runs locally in your browser. Nothing is uploaded.',
    tips: [
      'Use 150 DPI for screen viewing; 300 DPI or higher for print and archiving.',
      'Long-image stitching suits chat logs, long screenshots and other continuous content.',
      'Switch between PNG and JPEG, and choose individual pages or one long image before exporting.',
    ],
  },
  img2pdf: {
    title: 'About Images to PDF',
    intro: 'Combine multiple JPG, PNG or WebP images into one PDF in the order you choose. Ideal for photos, scans and chat screenshots; everything runs locally.',
    tips: [
      'Pages follow the list order; drag items to rearrange them before converting.',
      'Each image keeps its own aspect ratio, so nothing is stretched or cropped.',
      'Send the result to the editor when you need watermarks, redactions or page rotation.',
    ],
  },
  unlock: {
    title: 'About unlocking PDFs',
    intro: 'Remove permission restrictions or an open password from PDFs you are authorized to handle. Files stay in your browser and are never uploaded.',
    tips: [
      'Permission restrictions affect copying, printing and editing; standard PDFs keep their text layer, while a few legacy encrypted files fall back to page images.',
      'An open password requires the current password. This tool does not crack unknown passwords.',
      'Only process files you own or have permission to modify, and follow the applicable law.',
    ],
  },
  encrypt: {
    title: 'About encrypting PDFs',
    intro: 'Add an open password and permission restrictions before sending contracts, ID documents or financial files.',
    tips: [
      'The open password is required; the owner password is optional and a random one is generated when left blank.',
      'AES-256 offers broad compatibility; permission flags are advisory constraints enforced by PDF readers.',
      'Keep the password safe. Encrypted files cannot be recovered if the password is lost.',
    ],
  },
}

const ko: Record<GuideModuleId, GuideCopy> = {
  splitter: {
    title: 'PDF 분할 안내',
    intro: '분할은 브라우저에서만 처리되며 파일은 업로드되지 않습니다. 장 추출, 스캔 문서 분할, 큰 파일 나누기에 적합합니다.',
    tips: [
      '범위 분할은 시작 페이지와 끝 페이지를 모두 포함합니다. 연속되지 않은 페이지는 "페이지 선택"으로 전환하세요.',
      '내보내기 전에 시작/끝 페이지를 미리 보고 범위를 확인하세요.',
      '페이지 방향은 유지됩니다. 암호가 걸린 파일은 먼저 PDF 잠금 해제에서 잠금을 해제하세요.',
    ],
  },
  editor: {
    title: 'PDF 편집 안내',
    intro: '페이지 순서 변경, 삭제, 회전, 텍스트/이미지 워터마크 추가, 민감한 내용 가리기를 할 수 있습니다. 모든 작업은 기기에서 처리됩니다.',
    tips: [
      '워터마크 설정은 캔버스에 즉시 표시되고 내보낸 PDF에도 자동으로 포함됩니다.',
      '썸네일을 끌어 페이지 순서를 바꾸고 Ctrl+Z로 실행 취소할 수 있습니다.',
      '가리기는 내보낸 PDF에 검은 블록으로 적용되며 원문은 복구할 수 없습니다.',
    ],
  },
  merger: {
    title: 'PDF 병합 안내',
    intro: '여러 PDF, JPG, PNG를 원하는 순서로 하나의 파일로 합칩니다. 파일은 로컬에 남아 계약서, 인보이스, 스캔 문서 정리에 적합합니다.',
    tips: [
      'PDF와 이미지를 함께 추가할 수 있으며 목록 순서대로 합쳐집니다.',
      '목록을 끌어 순서를 바꾸고 병합 전에 페이지 수를 확인하세요.',
      '결과를 바로 다운로드하거나 편집기로 보내 추가 작업을 할 수 있습니다.',
    ],
  },
  toolbox: {
    title: 'PDF → 이미지 안내',
    intro: 'PDF를 이미지로 변환하는 작업은 브라우저에서 처리되며 파일이 업로드되지 않습니다.',
    tips: [
      '화면 확인은 150 DPI, 인쇄와 보관은 300 DPI 이상을 권장합니다.',
      '긴 이미지 합치기는 채팅 기록, 긴 스크린샷 등 연속된 내용에 적합합니다.',
      '내보내기 전에 PNG / JPEG를 선택하고 개별 이미지 또는 긴 이미지로 저장하세요.',
    ],
  },
  img2pdf: {
    title: '이미지 → PDF 안내',
    intro: '여러 JPG, PNG, WebP 이미지를 원하는 순서로 하나의 PDF로 합칩니다. 사진, 스캔본, 채팅 스크린샷 정리에 적합하며 모든 처리는 로컬에서 이루어집니다.',
    tips: [
      '이미지는 목록 순서대로 페이지가 되며, 끌어서 순서를 바꿀 수 있습니다.',
      '각 이미지는 원본 가로세로 비율을 유지하므로 늘어나거나 잘리지 않습니다.',
      '워터마크, 가리기, 회전이 필요하면 결과를 편집기로 보내세요.',
    ],
  },
  unlock: {
    title: 'PDF 잠금 해제 안내',
    intro: '권한이 있는 PDF의 권한 제한이나 열기 암호를 제거합니다. 파일은 브라우저 안에서만 처리되고 업로드되지 않습니다.',
    tips: [
      '권한 제한은 복사, 인쇄, 편집에 영향을 줍니다. 표준 PDF는 텍스트 레이어가 유지되지만, 일부 구형 암호화 파일은 페이지 이미지로 변환됩니다.',
      '열기 암호는 현재 암호를 알고 있어야 합니다. 알 수 없는 암호를 해독하지 않습니다.',
      '소유했거나 처리 권한이 있는 파일만 사용하고 관련 법규를 준수하세요.',
    ],
  },
  encrypt: {
    title: 'PDF 암호화 안내',
    intro: '계약서, 신분증, 재무 파일을 보내기 전에 열기 암호와 권한 제한을 추가합니다.',
    tips: [
      '열기 암호는 필수이며, 권한 암호는 선택 사항입니다. 비워 두면 임의의 암호가 생성됩니다.',
      'AES-256은 호환성이 높고, 권한 플래그는 PDF 리더가 따르는 권고 사항입니다.',
      '암호를 안전하게 보관하세요. 분실하면 암호화된 파일을 복구할 수 없습니다.',
    ],
  },
}

const ja: Record<GuideModuleId, GuideCopy> = {
  splitter: {
    title: 'PDF 分割について',
    intro: '分割はブラウザ内で完結し、ファイルはアップロードされません。章の抽出、スキャン文書の分割、大きなファイルの小分けに適しています。',
    tips: [
      '範囲指定では開始ページと終了ページの両方が含まれます。連続しないページは「ページ選択」に切り替えてください。',
      '書き出す前に開始・終了ページをプレビューして範囲を確認できます。',
      'ページの向きは保持されます。暗号化されたファイルは先に PDF ロック解除で解除してください。',
    ],
  },
  editor: {
    title: 'PDF 編集について',
    intro: 'ページの並べ替え・削除・回転、テキストや画像の透かし追加、機密情報のマスクができます。すべての処理は端末内で行われます。',
    tips: [
      '透かしの設定はキャンバスにすぐ反映され、書き出した PDF にも自動で含まれます。',
      'サムネイルをドラッグしてページ順を変更できます。Ctrl+Z で元に戻せます。',
      'マスクは書き出した PDF に黒いブロックとして焼き込まれ、元の内容は復元できません。',
    ],
  },
  merger: {
    title: 'PDF 結合について',
    intro: '複数の PDF、JPG、PNG を指定した順序で 1 つのファイルに結合します。ファイルはローカルに留まり、契約書や請求書、スキャン文書の整理に適しています。',
    tips: [
      'PDF と画像を混在して追加でき、リストの順序で結合されます。',
      'リストをドラッグして順序を変更し、結合前にページ数を確認してください。',
      '結果をそのままダウンロードするか、編集画面に送って続けて処理できます。',
    ],
  },
  toolbox: {
    title: 'PDF → 画像について',
    intro: 'PDF の画像変換はブラウザ内で処理され、ファイルはアップロードされません。',
    tips: [
      '画面確認には 150 DPI、印刷や保存には 300 DPI 以上を推奨します。',
      '長い画像の結合はチャット履歴や長いスクリーンショットなどの連続した内容に適しています。',
      '書き出す前に PNG / JPEG を選び、個別画像か長い画像かを指定できます。',
    ],
  },
  img2pdf: {
    title: '画像 → PDF について',
    intro: '複数の JPG、PNG、WebP 画像を指定した順序で 1 つの PDF にまとめます。写真、スキャン、チャットのスクリーンショット整理に適し、すべてローカルで処理されます。',
    tips: [
      '画像はリスト順にページになります。ドラッグして順序を変更できます。',
      '各画像は元の縦横比を保つため、引き伸ばしや切り抜きは行われません。',
      '透かし、マスク、回転が必要な場合は結果を編集画面に送れます。',
    ],
  },
  unlock: {
    title: 'PDF ロック解除について',
    intro: '権限のある PDF から権限制限や開くためのパスワードを解除します。ファイルはブラウザ内だけで処理され、アップロードされません。',
    tips: [
      '権限制限はコピー、印刷、編集に影響します。標準的な PDF はテキスト層が保持されますが、一部の古い暗号化ファイルはページ画像に変換されます。',
      '開くためのパスワードは現在のパスワードが必要です。不明なパスワードの解析は行いません。',
      '所有している、または処理権限のあるファイルのみを対象とし、関連法規を守ってください。',
    ],
  },
  encrypt: {
    title: 'PDF 暗号化について',
    intro: '契約書、身分証明書、財務ファイルを送る前に、開くためのパスワードと権限制限を追加します。',
    tips: [
      '開くためのパスワードは必須です。権限パスワードは任意で、空欄の場合はランダムに生成されます。',
      'AES-256 は互換性が高く、権限フラグは PDF リーダーが従う勧告的な制限です。',
      'パスワードは安全に保管してください。忘れると暗号化されたファイルは復元できません。',
    ],
  },
}

const de: Record<GuideModuleId, GuideCopy> = {
  splitter: {
    title: 'Über das Aufteilen von PDFs',
    intro: 'Das Aufteilen läuft vollständig im Browser; Dateien werden nicht hochgeladen. Ideal zum Extrahieren von Kapiteln, Teilen von Scans oder Aufteilen großer Dateien.',
    tips: [
      'Ein Seitenbereich enthält Start- und Endseite. Für nicht zusammenhängende Seiten zu „Seiten auswählen“ wechseln.',
      'Vor dem Export die Start- und Endseite in der Vorschau prüfen.',
      'Die Seitenausrichtung bleibt erhalten. Verschlüsselte Dateien zuerst im Modul „PDF entsperren“ entsperren.',
    ],
  },
  editor: {
    title: 'Über den PDF-Editor',
    intro: 'Seiten sortieren, löschen und drehen, Text- oder Bildwasserzeichen hinzufügen und sensible Inhalte schwärzen. Alles bleibt lokal auf deinem Gerät.',
    tips: [
      'Wasserzeichen erscheinen sofort auf der Leinwand und werden automatisch in die exportierte PDF übernommen.',
      'Miniaturen ziehen, um die Reihenfolge zu ändern; Ctrl+Z macht Änderungen rückgängig.',
      'Schwärzungen werden als schwarze Blöcke in die PDF eingebrannt und lassen sich nicht wiederherstellen.',
    ],
  },
  merger: {
    title: 'Über das Zusammenführen von PDFs',
    intro: 'Mehrere PDFs, JPGs und PNGs in der gewünschten Reihenfolge zu einer Datei zusammenführen. Dateien bleiben lokal – ideal für Verträge, Rechnungen und Scans.',
    tips: [
      'PDFs und Bilder lassen sich mischen und werden in Listenreihenfolge zusammengefügt.',
      'Liste ziehen, um die Reihenfolge zu ändern, und vor dem Zusammenführen die Seitenzahl prüfen.',
      'Ergebnis direkt herunterladen oder zum Weiterbearbeiten an den Editor senden.',
    ],
  },
  toolbox: {
    title: 'Über PDF zu Bildern',
    intro: 'Die PDF-zu-Bild-Konvertierung läuft lokal im Browser. Es wird nichts hochgeladen.',
    tips: [
      '150 DPI für den Bildschirm, 300 DPI oder mehr für Druck und Archivierung.',
      'Das Zusammenfügen langer Bilder eignet sich für Chatverläufe, lange Screenshots und ähnliche Inhalte.',
      'Vor dem Export zwischen PNG und JPEG wählen und einzelne Seiten oder ein langes Bild ausgeben.',
    ],
  },
  img2pdf: {
    title: 'Über Bilder zu PDF',
    intro: 'Mehrere JPG-, PNG- oder WebP-Bilder in der gewünschten Reihenfolge zu einer PDF zusammenfassen. Ideal für Fotos, Scans und Chat-Screenshots; alles läuft lokal.',
    tips: [
      'Die Seiten folgen der Listenreihenfolge; vor dem Umwandeln per Drag-and-drop sortieren.',
      'Jedes Bild behält sein Seitenverhältnis und wird weder gestreckt noch beschnitten.',
      'Bei Bedarf das Ergebnis zum Editor senden, um Wasserzeichen, Schwärzungen oder Drehungen hinzuzufügen.',
    ],
  },
  unlock: {
    title: 'Über das Entsperren von PDFs',
    intro: 'Entfernt Berechtigungsbeschränkungen oder ein Öffnungskennwort aus PDFs, für die du berechtigt bist. Dateien bleiben im Browser und werden nicht hochgeladen.',
    tips: [
      'Berechtigungen betreffen Kopieren, Drucken und Bearbeiten; bei Standard-PDFs bleibt die Textebene erhalten, bei einigen älteren verschlüsselten Dateien wird seitenweise gerastert.',
      'Für ein Öffnungskennwort wird das aktuelle Kennwort benötigt. Unbekannte Kennwörter werden nicht geknackt.',
      'Nur Dateien verarbeiten, die dir gehören oder für die du eine Berechtigung hast, und geltendes Recht beachten.',
    ],
  },
  encrypt: {
    title: 'Über das Verschlüsseln von PDFs',
    intro: 'Öffnungskennwort und Berechtigungen hinzufügen, bevor Verträge, Ausweise oder Finanzunterlagen versendet werden.',
    tips: [
      'Das Öffnungskennwort ist erforderlich; das Besitzerkennwort ist optional und wird bei leerem Feld zufällig erzeugt.',
      'AES-256 ist breit kompatibel; Berechtigungsflags sind empfehlende Einschränkungen der PDF-Reader.',
      'Kennwort sicher aufbewahren. Verschlüsselte Dateien lassen sich bei Verlust nicht wiederherstellen.',
    ],
  },
}

export const guideMessages: Record<Locale, Record<GuideModuleId, GuideCopy>> = { zh, en, ko, ja, de }