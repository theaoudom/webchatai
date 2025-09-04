// app/dom-store/page.jsx

import path from 'path';
import fs from 'fs';
import AppInfoParser from 'app-info-parser';
import { StorePageContent } from '@/components/StorePageContent';

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function getApkInfo() {
  try {
    const apkPath = path.resolve(process.cwd(), 'public/apk/dom-ai.apk');
    
    if (!fs.existsSync(apkPath)) {
      console.error('APK file not found.');
      return { versionName: null, fileSize: null };
    }

    const stats = fs.statSync(apkPath);
    const fileSize = formatBytes(stats.size);

    const parser = new AppInfoParser(apkPath);
    const result = await parser.parse();
    const versionName = result.versionName || null;

    return { versionName, fileSize };

  } catch (error) {
    console.error('Error parsing APK:', error);
    return { versionName: null, fileSize: null };
  }
}

const DomStorePage = async () => {
  const { versionName, fileSize } = await getApkInfo();
  
  return <StorePageContent versionName={versionName} fileSize={fileSize} />;
};

export default DomStorePage;