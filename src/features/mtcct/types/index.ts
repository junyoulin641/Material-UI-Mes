// MTCCT 型別定義

export interface MTCCTFolder {
  id: string;
  name: string;
  path: string;
  size: string;
  fileCount: number;
  lastModified: Date;
  status: 'available' | 'downloading' | 'error' | 'completed';
  type: 'log' | 'data' | 'config' | 'backup';
}

export interface MTCCTFile {
  id: string;
  name: string;
  path: string;
  size: string;
  type: string;
  lastModified: Date;
  folderId: string;
}
