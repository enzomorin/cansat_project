#include "System_Check.h"

constexpr uint16_t RESPONSE_TIMEOUT_MS = 200;

System_Check::System_Check(const Config& config)
    :_config(config) {}

uint8_t System_Check::run() {
    uint8_t _status = OK;

    // put the check componant logic here (with the functions outside it)
    //_status |= checkServo();
    //_status |= checkSD();

    return _status;
}