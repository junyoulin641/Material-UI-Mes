import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh-TW' | 'zh-CN' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  'zh-TW': {
    // Dashboard
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
    'settings': '設定',

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
    'simplified.chinese': '简体中文',
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
    'enter.work.order': '輸入工單號碼...'
  },
  'zh-CN': {
    // Dashboard
    'mes.overview': 'MES 总览',
    'total.tests': '总测试数',
    'pass.rate': '通过率',
    'failed.tests': '失败测试',
    'last.7.days': '最近 7 天',
    'recent.deals': '最近交易',
    'detailed.stats': '详细统计',
    'charts.analysis': '图表分析',
    'test.trends': '测试趋势',
    'station.performance': '站别表现',
    'daily.summary': '每日摘要',
    'test.results.distribution': '测试结果分布',
    'station.test.count': '各站测试数量',
    'recent.test.records': '最近测试记录',
    'view.all.records': '查看所有记录',
    'export.data': '导出数据',
    'refresh.data': '重新加载数据',

    // Navigation
    'dashboard': '仪表板',
    'test.records': '测试记录',
    'log.query': 'LOG 查询',
    'settings': '设置',

    // Settings
    'system.settings': '系统设置',
    'mes.advanced.config': 'MES 系统高级设置与配置管理',
    'basic.settings': '基本设置',
    'data.management': '数据管理',
    'security.settings': '安全设置',
    'notification.settings': '通知设置',
    'system.info': '系统信息',
    'station.management': '站别管理',
    'model.management': '机种管理',
    'interface.settings': '界面设置',
    'theme': '主题',
    'language': '语言',
    'timezone': '时区',
    'light.theme': '亮色主题',
    'dark.theme': '暗色主题',
    'auto.theme': '自动切换',
    'traditional.chinese': '繁体中文',
    'simplified.chinese': '简体中文',
    'english': 'English',
    'taipei.time': '台北时间',
    'beijing.time': '北京时间',
    'tokyo.time': '东京时间',
    'add.station': '新增站别',
    'add.model': '新增机种',
    'save.settings': '保存设置',
    'refresh': '重新加载',

    // Log Query
    'log.query.title': 'LOG 查询',
    'log.query.desc': '搜索和查看制造测试日志',
    'work.order': '工单号码',
    'serial.number': '序号',
    'station': '站别',
    'model': '机种',
    'date.from': '开始日期',
    'date.to': '结束日期',
    'search': '搜索',
    'clear': '清除',
    'search.results': '搜索结果',
    'no.results': '未找到结果。请执行搜索以查看 LOG 文件。',

    // Test Records
    'test.records.title': '测试记录',
    'test.records.desc': '查看和管理所有制造测试记录',

    // Quick Filters
    'quick.filters': '快速筛选',
    'all': '全部',
    'today': '今日',
    'yesterday': '昨日',
    'this.week': '本周',
    'last.week': '上周',
    'this.month': '本月',
    'last.month': '上月',
    'pass': '通过',
    'fail': '失败',
    'reset.filters': '重置筛选',
    'apply.filters': '应用筛选',
    'filter.by.result': '按结果筛选',
    'filter.by.date': '按日期筛选',
    'filter.by.station': '按站别筛选',
    'filter.by.model': '按机种筛选',
    'filter.by.serial': '按序号筛选',
    'serial.number.search': '序号搜索',
    'enter.serial.number': '输入序号关键字...',
    'work.order.search': '工单搜索',
    'enter.work.order': '输入工单号码...'
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
    'settings': 'Settings',

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
    'simplified.chinese': '简体中文',
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
    'quick.filters': 'Quick Filters',
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
    'enter.work.order': 'Enter work order number...'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mes-language');
    return (saved as Language) || 'zh-TW';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('mes-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('mes-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}