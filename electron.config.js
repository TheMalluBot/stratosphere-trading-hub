
module.exports = {
  packagerConfig: {
    name: 'AlgoTrade Pro',
    executableName: 'algotrade-pro',
    icon: './assets/icon',
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.config.js)|(forge.config.js)/
    ],
    extraResource: [
      './assets'
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'algotrade_pro',
        setupIcon: './assets/icon.ico',
        setupExe: 'AlgoTradePro-Setup.exe',
        certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
        certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'AlgoTrade Pro',
          homepage: 'https://algotradepro.com',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
