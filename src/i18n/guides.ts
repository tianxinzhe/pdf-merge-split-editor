import type { GuideCopy, Locale, ModuleId } from './types'

const zh: Record<ModuleId, GuideCopy> = {
  splitter: {
    title: '关于 PDF 拆分',
    intro: '拆分在浏览器本地完成，文件不会上传。适合提取章节、拆分扫描件，或把大文件切成便于分享的小文件。',
    tips: [
      '范围区间会包含起止页；需要不连续的页面时切换到「离散多选」。',
      '导出前可以预览起止页，确认内容无误再下载。',
      '拆分会保留原页面方向；加密文件请先在工具箱中解锁。',
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
    title: '关于 PDF 工具箱',
    intro: 'PDF 转图片和密码脱壳都在浏览器本地完成，不会上传文件。',
    tips: [
      '屏幕查看选 150 DPI，打印或存档建议 300 DPI 以上。',
      '拼接长图适合聊天记录、网页长截图等连续内容。',
      '密码脱壳仅用于你有权处理的文件，请遵守相关法律与服务条款。',
    ],
  },
}

const en: Record<ModuleId, GuideCopy> = {
  splitter: {
    title: 'About splitting PDFs',
    intro: 'Splitting runs entirely in your browser; files are never uploaded. Use it to extract chapters, split scans, or break a large file into shareable parts.',
    tips: [
      'A page range includes both the start and end page. Switch to "Pick pages" for non-consecutive pages.',
      'Preview the first and last page before exporting to make sure the range is right.',
      'Page orientation is preserved. Unlock encrypted files in the Toolbox first.',
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
    title: 'About the PDF toolbox',
    intro: 'PDF-to-image conversion and password removal run locally in your browser. Nothing is uploaded.',
    tips: [
      'Use 150 DPI for screen viewing; 300 DPI or higher for print and archiving.',
      'Long-image stitching suits chat logs, long screenshots and other continuous content.',
      'Only remove passwords from files you have the right to process, and follow applicable laws and terms.',
    ],
  },
}

const ko: Record<ModuleId, GuideCopy> = {
  splitter: {
    title: 'PDF 분할 안내',
    intro: '분할은 브라우저에서만 처리되며 파일은 업로드되지 않습니다. 장 추출, 스캔 문서 분할, 큰 파일 나누기에 적합합니다.',
    tips: [
      '범위 분할은 시작 페이지와 끝 페이지를 모두 포함합니다. 연속되지 않은 페이지는 "페이지 선택"으로 전환하세요.',
      '내보내기 전에 시작/끝 페이지를 미리 보고 범위를 확인하세요.',
      '페이지 방향은 유지됩니다. 암호가 걸린 파일은 먼저 도구함에서 잠금을 해제하세요.',
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
    title: 'PDF 도구함 안내',
    intro: 'PDF를 이미지로 변환하고 암호를 제거하는 작업은 브라우저에서 처리되며 파일이 업로드되지 않습니다.',
    tips: [
      '화면 확인은 150 DPI, 인쇄와 보관은 300 DPI 이상을 권장합니다.',
      '긴 이미지 합치기는 채팅 기록, 긴 스크린샷 등 연속된 내용에 적합합니다.',
      '암호 제거는 처리 권한이 있는 파일에만 사용하고 관련 법률과 약관을 지키세요.',
    ],
  },
}

const ja: Record<ModuleId, GuideCopy> = {
  splitter: {
    title: 'PDF 分割について',
    intro: '分割はブラウザ内で完結し、ファイルはアップロードされません。章の抽出、スキャン文書の分割、大きなファイルの小分けに適しています。',
    tips: [
      '範囲指定では開始ページと終了ページの両方が含まれます。連続しないページは「ページ選択」に切り替えてください。',
      '書き出す前に開始・終了ページをプレビューして範囲を確認できます。',
      'ページの向きは保持されます。暗号化されたファイルは先にツールボックスでロックを解除してください。',
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
    title: 'PDF ツールボックスについて',
    intro: 'PDF の画像変換とパスワード解除はブラウザ内で処理され、ファイルはアップロードされません。',
    tips: [
      '画面確認には 150 DPI、印刷や保存には 300 DPI 以上を推奨します。',
      '長い画像の結合はチャット履歴や長いスクリーンショットなどの連続した内容に適しています。',
      'パスワード解除は処理する権利のあるファイルにのみ使用し、関連法規と利用規約を守ってください。',
    ],
  },
}

const de: Record<ModuleId, GuideCopy> = {
  splitter: {
    title: 'Über das Aufteilen von PDFs',
    intro: 'Das Aufteilen läuft vollständig im Browser; Dateien werden nicht hochgeladen. Ideal zum Extrahieren von Kapiteln, Teilen von Scans oder Aufteilen großer Dateien.',
    tips: [
      'Ein Seitenbereich enthält Start- und Endseite. Für nicht zusammenhängende Seiten zu „Seiten auswählen“ wechseln.',
      'Vor dem Export die Start- und Endseite in der Vorschau prüfen.',
      'Die Seitenausrichtung bleibt erhalten. Verschlüsselte Dateien zuerst im Werkzeugkasten entsperren.',
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
    title: 'Über die PDF-Toolbox',
    intro: 'PDF-zu-Bild-Konvertierung und Passwortentfernung laufen lokal im Browser. Es wird nichts hochgeladen.',
    tips: [
      '150 DPI für den Bildschirm, 300 DPI oder mehr für Druck und Archivierung.',
      'Das Zusammenfügen langer Bilder eignet sich für Chatverläufe, lange Screenshots und ähnliche Inhalte.',
      'Passwörter nur bei Dateien entfernen, für deren Verarbeitung du berechtigt bist, und geltende Gesetze sowie Nutzungsbedingungen beachten.',
    ],
  },
}

export const guideMessages: Record<Locale, Record<ModuleId, GuideCopy>> = { zh, en, ko, ja, de }