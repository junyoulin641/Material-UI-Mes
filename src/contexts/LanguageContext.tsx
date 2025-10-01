/**
 * LanguageContext.tsx - 多語言支援的 Context 系統
 *
 * 這個檔案展示：
 * 1. 如何建立和使用 React Context（全域狀態管理）
 * 2. 自訂 Hook 的建立方式（useLanguage）
 * 3. Context Provider 的實作模式
 * 4. localStorage 的整合應用（持久化語言設定）
 *
 * Context 三部曲：
 * - createContext: 建立 Context（建立共享資料的容器）
 * - Provider: 提供資料給子組件（資料提供者）
 * - useContext: 在子組件中使用資料（資料消費者）
 *
 * 學習概念：Context API, Custom Hook, TypeScript, localStorage
 */

// ===== Import 區塊 =====
// React 核心：提供 Context API 和 Hooks
import React, { createContext, useContext, useState, useEffect } from 'react';

// ===== TypeScript 類型定義 =====

/**
 * Language 類型定義
 * 限制語言只能是以下三種之一（聯合類型）
 */
export type Language = 'zh-TW' | 'zh-CN' | 'en-US';

/**
 * LanguageContext 的資料結構
 * 定義 Context 提供給子組件的資料和方法
 */
interface LanguageContextType {
  language: Language;                        // 當前語言（'zh-TW' 或 'zh-CN' 或 'en-US'）
  setLanguage: (language: Language) => void; // 切換語言的函數
  t: (key: string) => string;                // 翻譯函數（translate 縮寫）
}

// ===== Context 建立 =====

/**
 * 建立 LanguageContext
 *
 * createContext<T | undefined>(undefined) 的意義：
 * - <T | undefined>: TypeScript 泛型，表示 Context 可以是 T 或 undefined
 * - undefined: 初始值設為 undefined
 * - 為什麼要這樣？確保必須在 Provider 內部使用，否則會是 undefined
 *
 * 這是一個常見的 Context 安全模式
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ===== 翻譯資料庫 =====

/**
 * translations - 多語言翻譯對照表
 *
 * 資料結構：
 * {
 *   '語言代碼': {
 *     '翻譯鍵': '翻譯文字'
 *   }
 * }
 *
 * 使用方式：translations['zh-TW']['mes.overview'] → 'MES 總覽'
 *
 * 這個物件包含所有 UI 文字的多語言版本
 * 當需要新增翻譯時，只需在這裡新增對應的鍵值對
 */
const translations = {
  'zh-TW': {
    // Dashboard - 儀表板相關翻譯
    'mes.overview': 'MES 總覽',
    'total.tests': '總測試數',
    'pass.rate': '通過率',
    'failed.tests': '失敗測試',
    'last.7.days': '最近 7 天',
    'recent.deals': '最近交易',
    'detailed.stats': '詳細統計',
    'charts.analysis': '圖表分析',
    'test.trends': '測試趨勢',
    'station.performance': '站別表現',
    'daily.summary': '每日摘要',
    'test.results.distribution': '測試結果分佈',
    'station.test.count': '各站測試數量',
    'recent.test.records': '最近測試記錄',
    'view.all.records': '查看所有記錄',
    'export.data': '匯出資料',
    'refresh.data': '重新整理資料',

    // Navigation
    'dashboard': '儀表板',
    'test.records': '測試記錄',
    'log.query': 'LOG 查詢',
    'mtcct.management': 'MTCCT 管理',
    'ai.analysis': 'AI 分析',
    'settings': '設定',
    'help.support': '幫助與支援',

    // Settings
    'system.settings': '系統設定',
    'mes.advanced.config': 'MES 系統進階設定與配置管理',
    'basic.settings': '基本設定',
    'data.management': '資料管理',
    'security.settings': '安全設定',
    'notification.settings': '通知設定',
    'system.info': '系統資訊',
    'station.management': '站別管理',
    'model.management': '機種管理',
    'interface.settings': '介面設定',
    'theme': '主題',
    'language': '語言',
    'timezone': '時區',
    'light.theme': '亮色主題',
    'dark.theme': '暗色主題',
    'auto.theme': '自動切換',
    'traditional.chinese': '繁體中文',
    'english': 'English',
    'taipei.time': '台北時間',
    'beijing.time': '北京時間',
    'tokyo.time': '東京時間',
    'add.station': '新增站別',
    'add.model': '新增機種',
    'save.settings': '儲存設定',
    'refresh': '重新整理',

    // Log Query
    'log.query.title': 'LOG 查詢',
    'log.query.desc': '搜尋和檢視製造測試日誌',
    'work.order': '工單號碼',
    'serial.number': '序號',
    'station': '站別',
    'model': '機種',
    'date.from': '開始日期',
    'date.to': '結束日期',
    'search': '搜尋',
    'clear': '清除',
    'search.results': '搜尋結果',
    'no.results': '找不到結果。請執行搜尋以檢視 LOG 檔案。',

    // Test Records
    'test.records.title': '測試記錄',
    'test.records.desc': '檢視和管理所有製造測試記錄',

    // Quick Filters
    'basic.conditions': '基本條件',
    'quick.filters': '快速篩選',
    'all': '全部',
    'today': '今日',
    'yesterday': '昨日',
    'this.week': '本週',
    'last.week': '上週',
    'this.month': '本月',
    'last.month': '上月',
    'pass': '通過',
    'fail': '失敗',
    'reset.filters': '重置篩選',
    'apply.filters': '套用篩選',
    'filter.by.result': '按結果篩選',
    'filter.by.date': '按日期篩選',
    'filter.by.station': '按站別篩選',
    'filter.by.model': '按機種篩選',
    'filter.by.serial': '按序號篩選',
    'serial.number.search': '序號搜尋',
    'enter.serial.number': '輸入序號關鍵字...',
    'work.order.search': '工單搜尋',
    'enter.work.order': '輸入工單號碼...',
    'data.range': '日期範圍',
    'common.time.range': '常用時段',
    'time': '時間',
    'start.time': '開始時間',
    'end.time': '結束時間',
    'tester': '測試人員',
    'batch.number': '批次號碼',
    'advanced.search': '進階搜尋',
    'advanced.search.desc': '進階搜尋', 
    'advanced.search.title': '進階搜尋', 
    'advanced.search.apply': '套用',
    'advanced.search.reset': '重置',
    'advanced.search.close': '關閉',
    'all.day': '全天',
    'morning': '上午',
    'afternoon': '下午',
    'evening': '晚上',
    'last.14.days': '最近14天',
    'last.30.days': '最近30天',
    'last.90.days': '最近90天',
    // Dashboard Cards
    'retest.count': '複測次數',
    'failure.reason': '失敗原因',
    'test.time': '測試時間',
    'part.number': '料號',
    'result': '結果',
    'actions': '操作',
    'view.details': '查看詳細',
    'download.log': '下載 LOG',
    'retest.details': '複測詳情清單',
    'recent.records': '最近測試記錄',
    'show.records': '顯示',
    'records': '筆記錄',
    'no.retest.records': '目前沒有複測記錄',
    'retest.detail.info': '複測詳細資訊',
    'basic.info': '基本資訊',
    'failed.items': '失敗測項',
    'no.failed.items': '無失敗測項資訊',
    'test.history': '測試歷史記錄',
    'close': '關閉',
    'times': '次',
    'model.filter': '機種篩選',
    'station.filter': '站別篩選',
    // Table Columns
    'column.serial.number': '序號',
    'column.station': '站別',
    'column.model': '機種',
    'column.part.number': '料號',
    'column.result': '結果',
    'column.test.time': '測試時間',
    'column.retest.count': '複測次數',
    'column.failed.items': '失敗測項名稱',
    'column.work.order': '工單號碼',
    'column.tester': '測試人員',

    // Stats Cards
    'total.count': '總測試數',
    'pass.count': '通過數',
    'fail.count': '失敗數',
    'retest.rate': '複測率',
    'avg.yield': '平均良率',

    // Charts
    'test.result.distribution': '測試結果分佈',
    'station.test.statistics': '各站測試統計',
    'daily.trend': '每日趨勢',
    'pass.trend': '通過趨勢',
    'fail.trend': '失敗趨勢',

    // Actions
    'export': '匯出',
    'import': '匯入',
    'delete': '刪除',
    'edit': '編輯',
    'cancel': '取消',
    'confirm': '確認',
    'save': '儲存',

    // AI Analysis
    'ai.analysis.title': 'AI 失敗原因分析',
    'ai.analysis.desc': '智能分析測試失敗原因',
    'training.data': '訓練資料',
    'batch.prediction': '批量預測',
    'model.management': '模型管理',
    'annotation': '標註',
    'confidence': '信心度',
    'suggested.category': '建議分類',

    // MTCCT
    'mtcct.title': 'MTCCT 資料夾管理',
    'mtcct.desc': '管理 MTCCT 測試資料資料夾',
    'folder.scan': '資料夾掃描',
    'file.count': '檔案數量',
    'download.all': '全部下載',

    // Settings Page
    'user.preferences': '個人化設定',
    'appearance.settings': '外觀設定',
    'dashboard.settings': '儀表板設定',
    'table.settings': '表格設定',
    'notification.settings': '通知設定',
    'theme.mode': '主題模式',
    'font.size': '字體大小',
    'compact.mode': '緊湊模式',
    'show.animations': '顯示動畫',
    'auto.refresh': '自動重新整理',
    'refresh.interval': '重新整理間隔',
    'default.date.range': '預設日期範圍',
    'records.per.page': '每頁筆數',
    'small': '小型',
    'medium': '中型',
    'large': '大型',
    'seconds': '秒',
    'minutes': '分鐘',

    // DashboardView - Missing translations
    'home': '首頁',
    'mes.dashboard.title': 'MES 數據監控儀表板',
    'export': '匯出',
    'csv.export': 'CSV 匯出',
    'json.export': 'JSON 匯出',
    'view.all': '查看全部',
    'total.test.count': '總測試數',
    'device.count': '設備數量',
    'test.yield': '測試良率',
    'passed': '通過',
    'failed': '失敗',
    'production.yield': '生產良率',
    'completed': '完成',
    'total': '總數',
    'retest.count.alt': '復測數量',
    'station.performance.stats': '各站點測試表現統計',
    'station.test.count': '站別測試數量',
    'station.performance.table': '站別表現統計',
    'model.test.stats': '機種測試統計',
    'test.count': '測試數量',
    'pass.count': '通過數量',
    'failure.analysis': '失敗原因分析',
    'test.item.name': '測項名稱',
    'failure.count': '失敗次數',
    'total.test.times': '總測試次數',
    'failure.rate': '失敗率',
    'distribution': '分佈',
    'no.failure.data': '目前沒有失敗測項資料',
    'retest.analysis': '復測統計分析',
    'original.test': '原始測試',
    'retest.times': '復測次數',
    'retest.passed': '復測通過',
    'retest.pass.rate': '復測通過率',
    'no.retest.data': '目前沒有復測資料',
    'serial.number': '序號',
    'station': '站別',
    'result': '結果',
    'time': '時間',
    'tester': '測試員',
    'show': '顯示',
    'slash.separator': '/ ',
    'excellent': '優秀',
    'good': '良好',
    'warning': '警告',
    'abnormal': '異常',
    'parenthesis.left': '(',
    'days.suffix': '天)',
    'times.suffix': '次',
    'test.failed': '測試失敗',

    // LogQueryView - Missing translations
    'log.query.page.title': 'LOG 查詢',
    'log.query.system': 'LOG 查詢系統',
    'log.query.description': '搜尋和檢視製造測試日誌，支援多條件篩選和內容預覽',
    'search.criteria': '搜尋條件',
    'work.order.number': '工單號碼',
    'enter.work.order': '輸入工單號碼...',
    'enter.serial.number': '輸入序號...',
    'all.stations': '全部站別',
    'all.models': '全部機種',
    'start.date': '開始日期',
    'end.date': '結束日期',
    'searching': '搜尋中...',
    'search.results': '📋 搜尋結果',
    'records.count': '筆記錄',
    'search.prompt': '請設定搜尋條件並點擊「搜尋」按鈕來查看 LOG 檔案',
    'no.log.files.found': '找不到符合條件的 LOG 檔案，請調整搜尋條件後重試',
    'test.time': '測試時間',
    'file.size': '檔案大小',
    'actions': '操作',
    'log.preview': 'LOG 檔案預覽',
    'preview.log': '預覽 LOG',
    'download.log': '下載 LOG',
    'download': '下載',
    'close': '關閉',

    // AIAnalysisView - Missing translations
    'ai.analysis.system': 'AI 失敗原因分析系統',
    'ai.analysis.description': '使用人工智慧技術自動分析測試失敗原因，提供智慧標註和預測功能',
    'overview': '總覽',
    'data.annotation': '資料標註',
    'total.training.data': '訓練資料總數',
    'verified': '已驗證',
    'average.confidence': '平均信心度',
    'prediction.accuracy': '預測準確度指標',
    'model.count': '模型數量',
    'available.suffix': '個可用',
    'best.accuracy': '最佳準確率',
    'model.performance': '模型表現',
    'failure.category.distribution': '失敗原因分類分佈',
    'battery.related': '電池相關',
    'communication.issues': '通訊問題',
    'hardware.failure': '硬體故障',
    'software.error': '軟體錯誤',
    'calibration.issues': '校正問題',
    'temperature.abnormal': '溫度異常',
    'power.issues': '電源問題',
    'sensor.failure': '感測器故障',
    'other.issues': '其他問題',
    'recent.activities': '最近活動',
    'log.content.analysis': 'LOG 內容分析',
    'enter.log.content': '請輸入測試失敗的 LOG 內容...',
    'analyzing': '分析中...',
    'ai.smart.analysis': 'AI 智慧分析',
    'ai.prediction.result': 'AI 預測結果:',
    'suggested.actions': '建議處理措施:',
    'confirm.category': '確認分類 (可修正 AI 預測)',
    'save.as.training.data': '保存為訓練資料',
    'training.dataset': '訓練資料集',
    'confidence': '信心度',
    'status': '狀態',
    'batch.prediction.function': '批量預測功能',
    'batch.prediction.desc1': '上傳多個 LOG 檔案，系統將自動使用訓練好的模型進行失敗原因預測。',
    'batch.prediction.desc2': '適用於大量測試資料的快速分析和分類。',
    'file.upload': '檔案上傳',
    'drag.log.files': '拖拽 LOG 檔案到此處或點擊選擇檔案',
    'supported.formats': '支援 .log, .txt 格式',
    'prediction.result': '預測結果',
    'prediction.result.desc': '上傳檔案後，預測結果將顯示在此處',
    'model.list': '模型列表',
    'training': '訓練中...',
    'train.new.model': '訓練新模型',
    'training.data.requirement': '需要至少 10 筆訓練資料才能開始訓練模型。目前有',
    'data.count.suffix': '筆資料。',
    'model.name': '模型名稱',
    'version': '版本',
    'accuracy': '準確率',
    'training.time': '訓練時間',
    'edit.annotation': '編輯標註',
    'log.content': 'LOG 內容',
    'failure.category': '失敗分類',
    'cancel': '取消',
    'save': '保存',

    // MTCCTView - Missing translations
    'mtcct.folder.management': 'MTCCT 資料夾管理',
    'mtcct.description': '管理和下載 MTCCT 系統中的測試資料、LOG 檔案和設定檔案',
    'search.folder.path': '搜尋資料夾名稱或路徑...',
    'scanning': '掃描中...',
    'scan.folders': '掃描資料夾',
    'folders.suffix': '個資料夾',
    'scanning.mtcct': '正在掃描 MTCCT 資料夾...',
    'size': '大小',
    'modified.time': '修改時間',
    'download.progress': '下載進度',
    'view': '查看',
    'no.folders.found': '未找到符合條件的資料夾',
    'no.mtcct.folders': '尚未發現任何 MTCCT 資料夾',
    'modify.search.criteria': '請嘗試修改搜尋條件',
    'click.scan.to.start': '點擊「掃描資料夾」按鈕開始搜尋',
    'path': '路徑',
    'file.list': '檔案列表',
    'files.suffix': '個檔案',
    'folder.no.files': '此資料夾暫無檔案',
    'download.entire.folder': '下載整個資料夾',

    // SettingsView - Missing translations
    'system.settings.title': '⚙️ 系統設定',
    'system.settings.description': '系統配置、資料匯入和管理功能',
    'importing.data': '正在匯入資料...',
    'import.complete.json': '匯入完成！JSON 檔案',
    'log.files': 'LOG 檔案',
    'successfully.paired': '成功配對',
    'total.records': '總記錄數',
    'test.data.import': '測試資料匯入',
    'import.description': '支援 JSON 和 LOG 檔案的單檔或批量匯入，系統會自動配對相關檔案',
    'select.files': '📁 選擇檔案',
    'select.folder': '📂 選擇資料夾',
    'add.station': '新增站別',
    'add.model': '新增機種',
    'system.management': '系統管理',
    'system.data.management': '系統資料管理和維護功能',
    'clear.all.data': '清空所有資料',
    'check.data.status': '檢查資料狀態',

    // AppRouter - Missing translations (Help page)
    'user.manual': '📖 用戶手冊',
    'user.manual.desc': '完整的 MES 系統使用說明，包括功能介紹、操作步驟等',
    'download.pdf': '下載 PDF',
    'tutorial.videos': '🎥 教學影片',
    'tutorial.videos.desc': '系統操作的視頻教程，快速上手各項功能',
    'watch.videos': '觀看影片',
    'technical.support': '📞 技術支援',
    'technical.support.desc': '遇到問題？聯繫我們的技術支援團隊',
    'phone.number': '電話：(02) 2345-6789',
    'support.email': 'Email：support@mes.com',
    'send.message': '發送訊息',
    'faq': '❓ 常見問題',
    'faq.desc': '查看常見問題的解答和故障排除指南',
    'browse.faq': '瀏覽 FAQ',
    'system.user': '系統用戶',
    'system.email': 'system@mes.local'
  },
  'en-US': {
    // Dashboard
    'mes.overview': 'MES Overview',
    'total.tests': 'Total Tests',
    'pass.rate': 'Pass Rate',
    'failed.tests': 'Failed Tests',
    'last.7.days': 'Last 7 days',
    'recent.deals': 'Recent Deals',
    'detailed.stats': 'Detailed Statistics',
    'charts.analysis': 'Charts Analysis',
    'test.trends': 'Test Trends',
    'station.performance': 'Station Performance',
    'daily.summary': 'Daily Summary',
    'test.results.distribution': 'Test Results Distribution',
    'station.test.count': 'Station Test Count',
    'recent.test.records': 'Recent Test Records',
    'view.all.records': 'View All Records',
    'export.data': 'Export Data',
    'refresh.data': 'Refresh Data',

    // Navigation
    'dashboard': 'Dashboard',
    'test.records': 'Test Records',
    'log.query': 'LOG Query',
    'mtcct.management': 'MTCCT Management',
    'ai.analysis': 'AI Analysis',
    'settings': 'Settings',
    'help.support': 'Help & Support',

    // Settings
    'system.settings': 'System Settings',
    'mes.advanced.config': 'MES System Advanced Configuration Management',
    'basic.settings': 'Basic Settings',
    'data.management': 'Data Management',
    'security.settings': 'Security Settings',
    'notification.settings': 'Notification Settings',
    'system.info': 'System Information',
    'station.management': 'Station Management',
    'model.management': 'Model Management',
    'interface.settings': 'Interface Settings',
    'theme': 'Theme',
    'language': 'Language',
    'timezone': 'Timezone',
    'light.theme': 'Light Theme',
    'dark.theme': 'Dark Theme',
    'auto.theme': 'Auto Switch',
    'traditional.chinese': '繁體中文',
    'english': 'English',
    'taipei.time': 'Taipei Time',
    'beijing.time': 'Beijing Time',
    'tokyo.time': 'Tokyo Time',
    'add.station': 'Add Station',
    'add.model': 'Add Model',
    'save.settings': 'Save Settings',
    'refresh': 'Refresh',

    // Log Query
    'log.query.title': 'LOG Query',
    'log.query.desc': 'Search and view manufacturing test logs',
    'work.order': 'Work Order',
    'serial.number': 'Serial Number',
    'station': 'Station',
    'model': 'Model',
    'date.from': 'Date From',
    'date.to': 'Date To',
    'search': 'Search',
    'clear': 'Clear',
    'search.results': 'Search Results',
    'no.results': 'No results found. Please perform a search to view LOG files.',

    // Test Records
    'test.records.title': 'Test Records',
    'test.records.desc': 'View and manage all manufacturing test records',

    // Quick Filters
    'basic.conditions': 'Basic Conditions',
    'quick.filters': 'Quick Filters',
    'model.filter': 'Model Filter',
    'station.filter': 'Station Filter',
    'all': 'All',
    'today': 'Today',
    'yesterday': 'Yesterday',
    'this.week': 'This Week',
    'last.week': 'Last Week',
    'this.month': 'This Month',
    'last.month': 'Last Month',
    'pass': 'Pass',
    'fail': 'Fail',
    'reset.filters': 'Reset Filters',
    'apply.filters': 'Apply Filters',
    'filter.by.result': 'Filter by Result',
    'filter.by.date': 'Filter by Date',
    'filter.by.station': 'Filter by Station',
    'filter.by.model': 'Filter by Model',
    'filter.by.serial': 'Filter by Serial',
    'serial.number.search': 'Serial Number Search',
    'enter.serial.number': 'Enter serial number keyword...',
    'work.order.search': 'Work Order Search',
    'enter.work.order': 'Enter work order number...',
    'data.range': 'Data Range',
    'common.time.range': 'Common Time Range',
    'time': 'Time',
    'start.time': 'Start Time',
    'end.time': 'End Time',
    'tester': 'Tester',
    'batch.number': 'Batch Number',
    'advanced.search': 'Advanced Search',
    'advanced.search.apply': 'Apply',
    'advanced.search.reset': 'Reset',
    'advanced.search.close': 'Close',
    'all.day': 'All Day',
    'morning': 'Morning',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'last.14.days': 'Last 14 Days',
    'last.30.days': 'Last 30 Days',
    'last.90.days': 'Last 90 Days',
    // Dashboard Cards
    'retest.count': 'Retest Count',
    'failure.reason': 'Failure Reason',
    'test.time': 'Test Time',
    'part.number': 'Part Number',
    'result': 'Result',
    'actions': 'Actions',
    'view.details': 'View Details',
    'download.log': 'Download LOG',
    'retest.details': 'Retest Details List',
    'recent.records': 'Recent Test Records',
    'show.records': 'Show',
    'records': 'Records',
    'no.retest.records': 'No retest records currently',
    'retest.detail.info': 'Retest Detail Information',
    'basic.info': 'Basic Information',
    'failed.items': 'Failed Items',
    'no.failed.items': 'No failed items information',
    'test.history': 'Test History Records',
    'close': 'Close',
    'times': 'Times',

    // Table Columns
    'column.serial.number': 'Serial Number',
    'column.station': 'Station',
    'column.model': 'Model',
    'column.part.number': 'Part Number',
    'column.result': 'Result',
    'column.test.time': 'Test Time',
    'column.retest.count': 'Retest Count',
    'column.failed.items': 'Failed Items',
    'column.work.order': 'Work Order',
    'column.tester': 'Tester',

    // Stats Cards
    'total.count': 'Total Count',
    'pass.count': 'Pass Count',
    'fail.count': 'Fail Count',
    'retest.rate': 'Retest Rate',
    'avg.yield': 'Average Yield',

    // Charts
    'test.result.distribution': 'Test Result Distribution',
    'station.test.statistics': 'Station Test Statistics',
    'daily.trend': 'Daily Trend',
    'pass.trend': 'Pass Trend',
    'fail.trend': 'Fail Trend',

    // Actions
    'export': 'Export',
    'import': 'Import',
    'delete': 'Delete',
    'edit': 'Edit',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'save': 'Save',

    // AI Analysis
    'ai.analysis.title': 'AI Failure Analysis',
    'ai.analysis.desc': 'Intelligent analysis of test failure reasons',
    'training.data': 'Training Data',
    'batch.prediction': 'Batch Prediction',
    'model.management': 'Model Management',
    'annotation': 'Annotation',
    'confidence': 'Confidence',
    'suggested.category': 'Suggested Category',

    // MTCCT
    'mtcct.title': 'MTCCT Folder Management',
    'mtcct.desc': 'Manage MTCCT test data folders',
    'folder.scan': 'Folder Scan',
    'file.count': 'File Count',
    'download.all': 'Download All',

    // Settings Page
    'user.preferences': 'User Preferences',
    'appearance.settings': 'Appearance Settings',
    'dashboard.settings': 'Dashboard Settings',
    'table.settings': 'Table Settings',
    'notification.settings': 'Notification Settings',
    'theme.mode': 'Theme Mode',
    'font.size': 'Font Size',
    'compact.mode': 'Compact Mode',
    'show.animations': 'Show Animations',
    'auto.refresh': 'Auto Refresh',
    'refresh.interval': 'Refresh Interval',
    'default.date.range': 'Default Date Range',
    'records.per.page': 'Records Per Page',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'seconds': 'seconds',
    'minutes': 'minutes',

    // DashboardView - Missing translations
    'home': 'Home',
    'mes.dashboard.title': 'MES Data Monitoring Dashboard',
    'export': 'Export',
    'csv.export': 'CSV Export',
    'json.export': 'JSON Export',
    'view.all': 'View All',
    'total.test.count': 'Total Tests',
    'device.count': 'Device Count',
    'test.yield': 'Test Yield',
    'passed': 'Passed',
    'failed': 'Failed',
    'production.yield': 'Production Yield',
    'completed': 'Completed',
    'total': 'Total',
    'retest.count.alt': 'Retest Count',
    'station.performance.stats': 'Station Test Performance Statistics',
    'station.test.count': 'Station Test Count',
    'station.performance.table': 'Station Performance Statistics',
    'model.test.stats': 'Model Test Statistics',
    'test.count': 'Test Count',
    'pass.count': 'Pass Count',
    'failure.analysis': 'Failure Reason Analysis',
    'test.item.name': 'Test Item Name',
    'failure.count': 'Failure Count',
    'total.test.times': 'Total Test Count',
    'failure.rate': 'Failure Rate',
    'distribution': 'Distribution',
    'no.failure.data': 'No failed test item data currently',
    'retest.analysis': 'Retest Statistical Analysis',
    'original.test': 'Original Test',
    'retest.times': 'Retest Count',
    'retest.passed': 'Retest Passed',
    'retest.pass.rate': 'Retest Pass Rate',
    'no.retest.data': 'No retest data currently',
    'serial.number': 'Serial Number',
    'station': 'Station',
    'result': 'Result',
    'time': 'Time',
    'tester': 'Tester',
    'show': 'Show',
    'slash.separator': '/ ',
    'excellent': 'Excellent',
    'good': 'Good',
    'warning': 'Warning',
    'abnormal': 'Abnormal',
    'parenthesis.left': '(',
    'days.suffix': ' days)',
    'times.suffix': ' times',
    'test.failed': 'Test Failed',

    // LogQueryView - Missing translations
    'log.query.page.title': 'LOG Query',
    'log.query.system': 'LOG Query System',
    'log.query.description': 'Search and view manufacturing test logs with multi-condition filtering and content preview',
    'search.criteria': 'Search Criteria',
    'work.order.number': 'Work Order',
    'enter.work.order': 'Enter work order...',
    'enter.serial.number': 'Enter serial number...',
    'all.stations': 'All Stations',
    'all.models': 'All Models',
    'start.date': 'Start Date',
    'end.date': 'End Date',
    'searching': 'Searching...',
    'search.results': '📋 Search Results',
    'records.count': ' records',
    'search.prompt': 'Please set search criteria and click "Search" button to view LOG files',
    'no.log.files.found': 'No matching LOG files found, please adjust search criteria and try again',
    'test.time': 'Test Time',
    'file.size': 'File Size',
    'actions': 'Actions',
    'log.preview': 'LOG File Preview',
    'preview.log': 'Preview LOG',
    'download.log': 'Download LOG',
    'download': 'Download',
    'close': 'Close',

    // AIAnalysisView - Missing translations
    'ai.analysis.system': 'AI Failure Reason Analysis System',
    'ai.analysis.description': 'Use AI technology to automatically analyze test failure reasons, providing smart annotation and prediction',
    'overview': 'Overview',
    'data.annotation': 'Data Annotation',
    'total.training.data': 'Total Training Data',
    'verified': 'Verified',
    'average.confidence': 'Average Confidence',
    'prediction.accuracy': 'Prediction Accuracy Metric',
    'model.count': 'Model Count',
    'available.suffix': ' available',
    'best.accuracy': 'Best Accuracy',
    'model.performance': 'Model Performance',
    'failure.category.distribution': 'Failure Reason Category Distribution',
    'battery.related': 'Battery Related',
    'communication.issues': 'Communication Issues',
    'hardware.failure': 'Hardware Failure',
    'software.error': 'Software Error',
    'calibration.issues': 'Calibration Issues',
    'temperature.abnormal': 'Temperature Abnormal',
    'power.issues': 'Power Issues',
    'sensor.failure': 'Sensor Failure',
    'other.issues': 'Other Issues',
    'recent.activities': 'Recent Activities',
    'log.content.analysis': 'LOG Content Analysis',
    'enter.log.content': 'Please enter test failure LOG content...',
    'analyzing': 'Analyzing...',
    'ai.smart.analysis': 'AI Smart Analysis',
    'ai.prediction.result': 'AI Prediction Result:',
    'suggested.actions': 'Suggested Actions:',
    'confirm.category': 'Confirm Category (Can Correct AI Prediction)',
    'save.as.training.data': 'Save as Training Data',
    'training.dataset': 'Training Dataset',
    'confidence': 'Confidence',
    'status': 'Status',
    'batch.prediction.function': 'Batch Prediction Function',
    'batch.prediction.desc1': 'Upload multiple LOG files, the system will automatically use trained model for failure reason prediction.',
    'batch.prediction.desc2': 'Suitable for quick analysis and classification of large test data.',
    'file.upload': 'File Upload',
    'drag.log.files': 'Drag LOG files here or click to select files',
    'supported.formats': 'Supports .log, .txt formats',
    'prediction.result': 'Prediction Result',
    'prediction.result.desc': 'Upload files and prediction results will be displayed here',
    'model.list': 'Model List',
    'training': 'Training...',
    'train.new.model': 'Train New Model',
    'training.data.requirement': 'Need at least 10 training data to start training model. Currently have ',
    'data.count.suffix': ' data.',
    'model.name': 'Model Name',
    'version': 'Version',
    'accuracy': 'Accuracy',
    'training.time': 'Training Time',
    'edit.annotation': 'Edit Annotation',
    'log.content': 'LOG Content',
    'failure.category': 'Failure Category',
    'cancel': 'Cancel',
    'save': 'Save',

    // MTCCTView - Missing translations
    'mtcct.folder.management': 'MTCCT Folder Management',
    'mtcct.description': 'Manage and download test data, LOG files and configuration files in MTCCT system',
    'search.folder.path': 'Search folder name or path...',
    'scanning': 'Scanning...',
    'scan.folders': 'Scan Folders',
    'folders.suffix': ' folders',
    'scanning.mtcct': 'Scanning MTCCT folders...',
    'size': 'Size',
    'modified.time': 'Modified Time',
    'download.progress': 'Download Progress',
    'view': 'View',
    'no.folders.found': 'No matching folders found',
    'no.mtcct.folders': 'No MTCCT folders discovered yet',
    'modify.search.criteria': 'Please try modifying search criteria',
    'click.scan.to.start': 'Click "Scan Folders" button to start search',
    'path': 'Path',
    'file.list': 'File List',
    'files.suffix': ' files',
    'folder.no.files': 'This folder has no files currently',
    'download.entire.folder': 'Download Entire Folder',

    // SettingsView - Missing translations
    'system.settings.title': '⚙️ System Settings',
    'system.settings.description': 'System configuration, data import and management functions',
    'importing.data': 'Importing data...',
    'import.complete.json': 'Import complete! JSON files: ',
    'log.files': ', LOG files: ',
    'successfully.paired': ', Successfully paired: ',
    'total.records': ', Total records: ',
    'test.data.import': 'Test Data Import',
    'import.description': 'Supports single or batch import of JSON and LOG files, system will automatically pair related files',
    'select.files': '📁 Select Files',
    'select.folder': '📂 Select Folder',
    'add.station': 'Add Station',
    'add.model': 'Add Model',
    'system.management': 'System Management',
    'system.data.management': 'System data management and maintenance functions',
    'clear.all.data': 'Clear All Data',
    'check.data.status': 'Check Data Status',

    // AppRouter - Missing translations (Help page)
    'user.manual': '📖 User Manual',
    'user.manual.desc': 'Complete MES system user manual, including feature introduction, operation steps, etc.',
    'download.pdf': 'Download PDF',
    'tutorial.videos': '🎥 Tutorial Videos',
    'tutorial.videos.desc': 'Video tutorials for system operation, quickly get started with various functions',
    'watch.videos': 'Watch Videos',
    'technical.support': '📞 Technical Support',
    'technical.support.desc': 'Encountered problems? Contact our technical support team',
    'phone.number': 'Phone: (02) 2345-6789',
    'support.email': 'Email: support@mes.com',
    'send.message': 'Send Message',
    'faq': '❓ FAQ',
    'faq.desc': 'View frequently asked questions and troubleshooting guide',
    'browse.faq': 'Browse FAQ',
    'system.user': 'System User',
    'system.email': 'system@mes.local'
  }
};

// ===== Provider 組件 =====

/**
 * LanguageProvider - 語言 Context 的提供者組件
 *
 * Props:
 * @param {React.ReactNode} children - 子組件（所有需要使用多語言功能的組件）
 *
 * 這個組件負責：
 * 1. 管理當前語言狀態
 * 2. 提供切換語言的方法
 * 3. 提供翻譯功能
 * 4. 將語言設定保存到 localStorage（持久化）
 *
 * 使用方式：
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // ===== State 管理 =====

  /**
   * language - 當前語言狀態
   *
   * useState 的特殊用法：傳入函數（Lazy Initialization）
   * - 好處：只在組件初次渲染時執行，避免每次渲染都讀取 localStorage
   * - 執行流程：
   *   1. 從 localStorage 讀取保存的語言設定
   *   2. 如果有保存的設定，使用它
   *   3. 如果沒有，使用預設值 'zh-TW'
   */
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mes-language');
    return (saved as Language) || 'zh-TW';
  });

  // ===== 方法定義 =====

  /**
   * setLanguage - 切換語言函數
   *
   * @param {Language} newLanguage - 新的語言設定
   *
   * 執行步驟：
   * 1. 更新 React 狀態（觸發重新渲染）
   * 2. 同時保存到 localStorage（持久化，下次打開網頁時保持設定）
   */
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('mes-language', newLanguage);
  };

  /**
   * t - 翻譯函數（translate 的縮寫）
   *
   * @param {string} key - 翻譯鍵（例如：'mes.overview'）
   * @returns {string} - 翻譯後的文字（例如：'MES 總覽'）
   *
   * 執行邏輯：
   * 1. 根據當前語言從 translations 查找對應的翻譯
   * 2. 如果找到，返回翻譯文字
   * 3. 如果找不到，返回原始 key（fallback 機制，避免顯示 undefined）
   *
   * 使用範例：
   * t('mes.overview') → 'MES 總覽' (當 language === 'zh-TW')
   */
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // ===== 副作用處理 =====

  /**
   * useEffect - 同步語言設定到 localStorage
   *
   * 依賴項：[language]
   * - 當 language 改變時執行
   * - 確保語言設定即時保存到 localStorage
   *
   * 為什麼需要這個 useEffect？
   * - 雖然 setLanguage 已經有保存邏輯，但這個 useEffect 提供額外保障
   * - 如果有其他地方直接使用 setLanguageState，也能確保 localStorage 同步
   */
  useEffect(() => {
    localStorage.setItem('mes-language', language);
  }, [language]);

  // ===== JSX 渲染 =====

  /**
   * LanguageContext.Provider
   *
   * value 屬性：提供給所有子組件的資料
   * - language: 當前語言
   * - setLanguage: 切換語言函數
   * - t: 翻譯函數
   *
   * 所有被 <LanguageProvider> 包裹的子組件都可以透過
   * useLanguage() Hook 取得這些資料和方法
   */
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ===== 自訂 Hook =====

/**
 * useLanguage - 使用語言 Context 的自訂 Hook
 *
 * 這是一個 Custom Hook，封裝了 useContext 的使用邏輯
 *
 * @returns {LanguageContextType} - 包含 language, setLanguage, t 的物件
 * @throws {Error} - 如果在 LanguageProvider 外部使用會拋出錯誤
 *
 * 使用方式：
 * ```tsx
 * function MyComponent() {
 *   const { language, setLanguage, t } = useLanguage();
 *
 *   return (
 *     <div>
 *       <h1>{t('mes.overview')}</h1>
 *       <button onClick={() => setLanguage('en-US')}>
 *         切換到英文
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * 為什麼要建立這個 Hook？
 * 1. 簡化使用：不需要每次都寫 useContext(LanguageContext)
 * 2. 型別安全：確保 Context 不是 undefined
 * 3. 錯誤處理：如果在 Provider 外使用，會有清楚的錯誤訊息
 */
export function useLanguage() {
  // 使用 useContext 取得 LanguageContext 的值
  const context = useContext(LanguageContext);

  // 安全檢查：確保 Hook 在 LanguageProvider 內部使用
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  // 返回 Context 的值（language, setLanguage, t）
  return context;
}

/**
 * ========================================
 * 學習重點總結
 * ========================================
 *
 * 1. React Context API
 *    - createContext: 建立共享資料的容器
 *    - Provider: 提供資料給子組件樹
 *    - useContext: 在任何子組件中讀取 Context 資料
 *
 * 2. Custom Hook 模式
 *    - 以 'use' 開頭命名
 *    - 封裝可重用的邏輯
 *    - 提供更好的錯誤處理和型別安全
 *
 * 3. TypeScript 實務
 *    - 使用 interface 定義資料結構
 *    - 使用聯合類型（Union Type）限制可能的值
 *    - 泛型（Generic）的應用
 *
 * 4. localStorage 整合
 *    - 用於持久化用戶設定
 *    - 在 useState 初始化時讀取
 *    - 在狀態改變時保存
 *
 * 5. React Hooks 進階技巧
 *    - useState 的 Lazy Initialization（傳入函數）
 *    - useEffect 的依賴項管理
 *    - 避免不必要的重新渲染
 *
 * ========================================
 * 下一步學習建議
 * ========================================
 *
 * 1. 學習其他 Context 的使用案例（主題、認證、購物車等）
 * 2. 了解 Context 的效能考量（避免不必要的重新渲染）
 * 3. 探索狀態管理庫（Redux, Zustand, Jotai）
 * 4. 學習更多 Custom Hook 的設計模式
 * 5. 深入理解 useEffect 的清理函數和依賴項規則
 */