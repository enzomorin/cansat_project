#pragma once

#include <cstdint>

namespace Pins {
    // D4 = SDA (I2C) -> BME280
    // D5 = SCL (I2C) -> BME280
    // D6 = TX (Serial1) -> OpenLog RXI
    // D7 = RX (Serial1) -> OpenLog TXO

    constexpr uint8_t BUTTON = 1;
    constexpr uint8_t JACK_PLUG = 2;
    constexpr uint8_t SERVO = 3;
    constexpr uint8_t HALL_SENSOR = 10; // need to review for the right pin (the little one i guess)
    constexpr uint8_t BUZZER = 13; // LED

    constexpr uint8_t DISPLAY_ADDR = 0x3C;
    constexpr uint8_t BME_ADDR = 0x76;
    constexpr uint8_t DISPLAY_RST = -1;

    constexpr uint8_t WATER_PRESSURE = A0;
    // handle spi radio code send the buffer into him and see if possible to get in a other file the mission logic (sd logging etc)
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