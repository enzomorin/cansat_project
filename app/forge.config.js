const { FusesPlugin } = require("@electron-forge/plugin-fuses")
const { FuseV1Options, FuseVersion } = require("@electron/fuses")

module.exports = {
    packagerConfig: {
        asar: true,
        executableName: "hydro-vinci",
        appId: "com.enzomorin.hydrovinci",
        name: "HydroVinci",

        icon: "./src/assets/icon",

        ignore: [
            /^\/server/,
            /^\/\.env/,
            /^\/node_modules\/.cache/,
            /README/,
            /\.git/,
        ],
    },

    rebuildConfig: {
        onlyModules: ["serialport"]
    },

    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                appId: "com.enzomorin.hydrovinci",
                name: "hydro-vinci",
                authors: "Enzo Morin",
                description: "Hydro Vinci — CanSat ground station",
                setupIcon: "./src/assets/icon.ico",
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["darwin"]
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                    maintainer: "Enzo Morin",
                    productDescription: "Hydro Vinci — CanSat ground station",
                    icon: "./src/assets/icon.png",
                    section: "utils"
                }
            }
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {
                options: {
                    maintainer: "Enzo Morin",
                    productDescription: "Hydro Vinci — CanSat ground station",
                    icon: "./src/assets/icon.png",
                    bin: "hydro-vinci",
                    requires: []
                }
            }
        }
    ],

    plugins: [
        {
            name: "@electron-forge/plugin-auto-unpack-natives",
            config: {}
        },
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        })
    ]
}