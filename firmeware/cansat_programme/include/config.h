#pragma once

#include <cstdint>

namespace Pins {
    constexpr uint8_t SERVO = 3;
    constexpr uint8_t DISPLAY_RST = 1;
    constexpr uint8_t DISPLAY_ADDR = 0x3C;
    constexpr uint8_t BME_ADDR = 0x76;
    constexpr uint8_t WATER_PRESSURE = A0;
    constexpr uint8_t HALL_SENSOR = 0;
    constexpr uint8_t JACK_PLUG = 8;
    constexpr uint8_t BUTTON = 6;
    constexpr uint8_t BUZZER = 9;
}

namespace Timings {
    constexpr uint32_t SERVO_LOGIC_DELAY_MS = 5000;

    constexpr uint32_t SERVO_PERIOD_MS   = 2000;
    constexpr uint32_t LOG_PERIOD_MS     = 1000;
    constexpr uint32_t FLUSH_PERIOD_MS   = 10000;
}

namespace Mission {
    constexpr float SEA_LEVEL_PRESSURE_HPA = 1013.25f;
}

namespace WaterConfig {
    constexpr uint16_t WATER_ADC_RESOLUTION = 4096; // 12-bit nRF52840
    constexpr float VREF = 3.3f; // XIAO supply voltage
    constexpr float DIVIDER_R1 = 10.0f; // kΩ
    constexpr float DIVIDER_R2 = 27.0f; // kΩ
}

namespace BMEConfig {
    constexpr uint32_t RETRY_INTERVAL_MS = 500;
    constexpr uint32_t TIMEOUT_MS = 10000;
}

namespace OpenLogConfig {
    constexpr uint16_t CMD_DELAY_MS = 120;
    constexpr uint16_t BOOT_DELAY_MS = 300;
    constexpr uint16_t RESPONSE_TIMEOUT_MS = 200;
}

namespace SystemCheckConfig {
    constexpr uint16_t SERVO_PULSE_US = 500;
}