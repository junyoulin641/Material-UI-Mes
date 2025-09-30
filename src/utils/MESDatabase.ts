export interface LogFile {
  id: string;
  serial: string;
  fileName: string;
  content: string;
  timestamp: Date;
  size: number;
}

export interface LogMapping {
  recordKey: string;
  serial: string;
  fileName: string;
  logId: string;
}

export interface TestRecord {
  id?: number;
  serialNumber: string;
  workOrder: string;
  station: string;
  model: string;
  result: 'PASS' | 'FAIL';
  testTime: string;
  tester: string;
  partNumber: string;
  items: Array<{
    name: string;
    value: any;
    result: 'PASS' | 'FAIL';
  }>;
}

export class MESDatabase {
  private dbName = 'MESTestData';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 建立 logFiles 表
        if (!db.objectStoreNames.contains('logFiles')) {
          const logStore = db.createObjectStore('logFiles', { keyPath: 'id' });
          logStore.createIndex('serial', 'serial', { unique: false });
          logStore.createIndex('fileName', 'fileName', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 建立 logMappings 表
        if (!db.objectStoreNames.contains('logMappings')) {
          const mappingStore = db.createObjectStore('logMappings', { keyPath: 'recordKey' });
          mappingStore.createIndex('serial', 'serial', { unique: false });
          mappingStore.createIndex('logId', 'logId', { unique: false });
        }

        // 建立 testRecords 表
        if (!db.objectStoreNames.contains('testRecords')) {
          const recordStore = db.createObjectStore('testRecords', { keyPath: 'id', autoIncrement: true });
          recordStore.createIndex('serialNumber', 'serialNumber', { unique: false });
          recordStore.createIndex('station', 'station', { unique: false });
          recordStore.createIndex('model', 'model', { unique: false });
          recordStore.createIndex('result', 'result', { unique: false });
          recordStore.createIndex('testTime', 'testTime', { unique: false });
        }
      };
    });
  }

  async saveLogFile(logFile: Omit<LogFile, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `${logFile.serial}_${Date.now()}`;
    const fullLogFile: LogFile = { ...logFile, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logFiles'], 'readwrite');
      const store = transaction.objectStore('logFiles');
      const request = store.add(fullLogFile);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Failed to save log file'));
    });
  }

  async saveLogMapping(mapping: LogMapping): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logMappings'], 'readwrite');
      const store = transaction.objectStore('logMappings');
      const request = store.put(mapping);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save log mapping'));
    });
  }

  async saveTestRecord(record: TestRecord): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords'], 'readwrite');
      const store = transaction.objectStore('testRecords');
      const request = store.add(record);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(new Error('Failed to save test record'));
    });
  }

  async saveTestRecords(records: TestRecord[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords'], 'readwrite');
      const store = transaction.objectStore('testRecords');

      let completed = 0;
      const total = records.length;

      if (total === 0) {
        resolve();
        return;
      }

      records.forEach(record => {
        const request = store.add(record);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => {
          reject(new Error('Failed to save test records'));
        };
      });
    });
  }

  async getAllTestRecords(): Promise<TestRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords'], 'readonly');
      const store = transaction.objectStore('testRecords');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get test records'));
    });
  }

  async getLogFileBySerial(serial: string): Promise<LogFile | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logFiles'], 'readonly');
      const store = transaction.objectStore('logFiles');
      const index = store.index('serial');
      const request = index.get(serial);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get log file'));
    });
  }

  async getLogMapping(recordKey: string): Promise<LogMapping | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logMappings'], 'readonly');
      const store = transaction.objectStore('logMappings');
      const request = store.get(recordKey);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get log mapping'));
    });
  }

  async getAllLogMappings(): Promise<LogMapping[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logMappings'], 'readonly');
      const store = transaction.objectStore('logMappings');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get log mappings'));
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['testRecords', 'logFiles', 'logMappings'], 'readwrite');

      const testStore = transaction.objectStore('testRecords');
      const logStore = transaction.objectStore('logFiles');
      const mappingStore = transaction.objectStore('logMappings');

      Promise.all([
        new Promise<void>((res) => {
          const req = testStore.clear();
          req.onsuccess = () => res();
        }),
        new Promise<void>((res) => {
          const req = logStore.clear();
          req.onsuccess = () => res();
        }),
        new Promise<void>((res) => {
          const req = mappingStore.clear();
          req.onsuccess = () => res();
        })
      ]).then(() => resolve()).catch(() => reject(new Error('Failed to clear data')));
    });
  }

  async clearOldData(daysOld: number = 30): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logFiles'], 'readwrite');
      const store = transaction.objectStore('logFiles');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to clear old data'));
    });
  }

  async getStorageInfo(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      } catch (error) {
        console.warn('Storage estimation not available:', error);
      }
    }

    return { used: 0, available: 0 };
  }
}

// 建立全域實例
let mesDB: MESDatabase | null = null;

export const getMESDatabase = async (): Promise<MESDatabase> => {
  if (!mesDB) {
    mesDB = new MESDatabase();
    await mesDB.init();

    // 將實例暴露到全域供其他組件使用
    (window as any).mesDB = mesDB;
  }
  return mesDB;
};

export default MESDatabase;