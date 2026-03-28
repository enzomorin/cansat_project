#pragma once

#include <Arduino.h>

class Buzzer_Logic {
    public:
        explicit Buzzer_Logic(uint8_t pin);

        void begin();

        void on();
        void off();
        void beep(uint16_t durationMs);

        // Patterns
        void bootOk();
        void telemetryOn();
        void telemetryOff();
        void logTick();
        void error(uint8_t errorByte);
        void jackBlocked();

    private:
        uint8_t _pin;

        void _wait(uint16_t ms);
};