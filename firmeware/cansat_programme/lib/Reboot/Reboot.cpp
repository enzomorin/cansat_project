#include "Reboot.h"

#ifdef NRF52_SERIES
#include <nrf_wdt.h>
#endif

Reboot::Reboot(uint32_t timeoutMs)
    : _timeout(timeoutMs) {}

void Reboot::begin() {
#ifdef NRF52_SERIES
    // Configure nRF52 hardware
    nrf_wdt_reload_value_set((_timeout / 1000) * 32768);
    nrf_wdt_reload_request_enable(NRF_WDT_RR0);
    nrf_wdt_task_trigger(NRF_WDT_TASK_START);
#endif
}

void Reboot::feed() {
#ifdef NRF52_SERIES
    nrf_wdt_reload_request_set(NRF_WDT_RR0);
#endif
}