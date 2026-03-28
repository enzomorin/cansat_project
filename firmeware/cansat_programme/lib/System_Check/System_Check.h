#pragma once

#include <Arduino.h>

namespace SystemStatus {
    constexpr uint8_t OK      = 0x00;
    constexpr uint8_t BME     = 0x01; // bit 0
    constexpr uint8_t WATER   = 0x02; // bit 1
    constexpr uint8_t HALL    = 0x04; // bit 2
    constexpr uint8_t SERVO   = 0x08; // bit 3
    constexpr uint8_t SD      = 0x10; // bit 4
    constexpr uint8_t SCREEN  = 0x20; // bit 5
}

class System_Check {
    public:
        System_Check() = default;

        void checkBME   (bool beginResult);
        void checkWater (bool beginResult);
        void checkHall  (bool beginResult);
        void checkServo (bool beginResult);
        void checkSD    (bool beginResult);        // Call each component's begin() and record failures
        void checkScreen(bool beginResult);

        uint8_t status() const { return _status; }
        bool ok() const { return _status == SystemStatus::OK; }
        bool failed(uint8_t component) const { return _status & component; }

    private:
        uint8_t _status = SystemStatus::OK;
};