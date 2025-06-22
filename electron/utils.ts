
import { app } from 'electron';

export const isDev = process.env.NODE_ENV === 'development';
export const platform = process.platform;

export const getAssetPath = (path: string): string => {
  return isDev
    ? `${__dirname}/../assets/${path}`
    : `${process.resourcesPath}/assets/${path}`;
};

export const autoUpdaterConfig = {
  provider: 'github',
  owner: 'your-username',
  repo: 'algotrade-pro',
  private: false,
};
