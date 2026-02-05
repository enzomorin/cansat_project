const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        executableName: "hydro-vinci", 
        icon: "./src/assets/icon.webp"
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    maintainer: "Enzo Morin",
                    productDescription: "Hydro Vinci — interface for monitoring and controlling the CanSat project.",
                    icon: "./src/assets/icon.webp",
                    section: "utils"
                }
            }
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    maintainer: "Enzo Morin",
                    productDescription: "Hydro Vinci — interface for monitoring and controlling the CanSat project.",
                    icon: "./src/assets/icon.webp",
                    bin: "hydro-vinci",
                    requires: [],
                }
            }
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        new FusesPlugin({
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};