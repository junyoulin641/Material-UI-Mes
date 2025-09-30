// MES 數據類型定義
export interface MESRecord {
  id: string;
  serial: string;
  station: string;
  model: string;
  datetime: string;
  date: string;
  time: string;
  result: 'PASS' | 'FAIL';
  Tester: string;
  FN: string;
  workOrder: string;
  Items: TestItem[];
}

export interface TestItem {
  name: string;
  value: string;
  result: string;
}

export interface MESStats {
  total: number;
  pass: number;
  fail: number;
  yieldRate: string;
  deviceCount: number;
  passedDeviceCount: number;
  failedDeviceCount: number;
  productionYieldRate: string;
  retestCount: number;
  producedDateCount: number;
}

export interface MESFilters {
  serial: string;
  startDate: string;
  endDate: string;
  station: string;
  model: string;
  workOrder: string;
}

export interface UserPreferences {
  [key: string]: any;
}

// 生成模擬 MES 數據 (暫時保留，但不使用)
export function generateMESData(): MESRecord[] {
  const stations = ['36_FA_FT01', '36_FA_FT02', '36_FA_FT03', '37_ICT_01', '37_ICT_02'];
  const models = ['WA3', 'WA4', 'WB1', 'WB2'];
  const testers = ['20010929A', '20020315B', '20030620C'];
  const mockData: MESRecord[] = [];

  for (let i = 0; i < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    const isPass = Math.random() > 0.15; // 85% PASS率

    // 生成測試項目
    const items = [];
    const itemCount = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < itemCount; j++) {
      items.push({
        name: `Test_Item_${j + 1}`,
        value: (Math.random() * 100).toFixed(2),
        result: isPass && Math.random() > 0.1 ? 'PASS' : 'FAIL'
      });
    }

    const serial = `CH${Math.random().toString(36).substr(2, 15).toUpperCase()}`;
    mockData.push({
      id: `${serial}_${date.getTime()}`,
      serial,
      station: stations[Math.floor(Math.random() * stations.length)],
      model: models[Math.floor(Math.random() * models.length)],
      datetime: date.toISOString().slice(0, 19).replace('T', ' '),
      date: date.toISOString().slice(0, 10),
      time: date.toTimeString().slice(0, 8),
      result: isPass ? 'PASS' : 'FAIL',
      Tester: testers[Math.floor(Math.random() * testers.length)],
      FN: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 10) + 1}`,
      workOrder: `621001842${Math.floor(Math.random() * 9)}-0001${Math.floor(Math.random() * 9)}`,
      Items: items
    });
  }

  return mockData;
}

// 計算 MES 統計數據
export function calculateMESStats(data: MESRecord[]): MESStats {
  const total = data.length;
  const pass = data.filter(r => r.result === 'PASS').length;
  const fail = total - pass;
  const yieldRate = total ? ((pass / total) * 100).toFixed(1) : '0.0';

  // 設備統計
  const devices = new Set(data.map(r => r.serial));
  const deviceCount = devices.size;
  const passedDevices = new Set(
    data.filter(r => r.result === 'PASS').map(r => r.serial)
  );
  const passedDeviceCount = passedDevices.size;
  const productionYieldRate = deviceCount ? ((passedDeviceCount / deviceCount) * 100).toFixed(1) : '0.0';

  // 複測統計
  const retestCount = Math.floor(fail * 0.3);

  return {
    total,
    pass,
    fail,
    yieldRate,
    deviceCount,
    passedDeviceCount,
    failedDeviceCount: deviceCount - passedDeviceCount,
    productionYieldRate,
    retestCount,
    producedDateCount: 7
  };
}