#pragma once

#include <cstdint>

namespace Pins {
    constexpr uint8_t SERVO = 3;
    constexpr uint8_t DISPLAY_RST = 2;
    constexpr uint8_t DISPLAY_ADDR = 0x78;
}

namespace Timings {
    constexpr uint32_t SERVO_LOGIC_DELAY_MS = 5000;

    constexpr uint32_t SERVO_PERIOD_MS   = 250;
    constexpr uint32_t LOG_PERIOD_MS     = 1000;
    constexpr uint32_t FLUSH_PERIOD_MS   = 10000;
}

namespace OpenLogConfig {
    constexpr uint16_t CMD_DELAY_MS  = 120;
    constexpr uint16_t BOOT_DELAY_MS = 300;
    constexpr uint16_t RESPONSE_TIMEOUT_MS = 200;
}

namespace SystemCheckConfig {
    constexpr uint16_t SD_TIMEOUT_MS = 200;
    constexpr uint16_t SERVO_PULSE_US = 500;
}