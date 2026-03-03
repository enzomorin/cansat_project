window.serialDataHistory ??= []

const scanButton = document.getElementById('scan-connect')
const importButton = document.getElementById('import-mission')

scanButton?.addEventListener('click', () => {
    window.api.openPortWindow?.()
})

importButton?.addEventListener('click', async () => {
    const filePath = await window.api.openCSVFile?.()
    if (!filePath) return

    await window.missionManager.startMission('csv', 'import', filePath)

    window.page.change('report')
    window.notif.success(`Fichier importé et copié dans log/missions`, null, 3000)
})

if (window.missionManager?.isActive()) {
    const type = window.missionManager.getCurrentMissionType()
    if (type === 'serial') {
        window.page.change('data_port')
        window.notif.info('Mission active : connexion série', null, 3000)
    } else if (type === 'report') {
        window.page.change('report')
        window.notif.info('Mission active : rapport en cours', null, 3000)
    }
}
