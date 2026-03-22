export function restoreMissionState() {
    const state = window.missionManager.getState()

    if (state?.active) {
        window.missionManager.restoreNavigation()
        window.notif.info("Mission restaurée", null, 3000)
    }
}