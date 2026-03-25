#pragma once
#include <Arduino.h>

class System_Check {
    public:
        // Bitmask status
        enum Status : uint8_t {
            OK          = 0,
            SERVO_FAIL  = 1 << 0,
            SD_FAIL     = 1 << 1,
            // add more later
        };

        struct Config {
            uint8_t servoPin = 255;
            HardwareSerial* sdSerial = nullptr;
            // add more later
        };

        explicit System_Check(const Config& config);

        // Run all checks
        uint8_t run();

    private:
        Config _config;

        // Individual checks functions (use in run())
        uint8_t checkServo();
        uint8_t checkSD();
        // add more later
};