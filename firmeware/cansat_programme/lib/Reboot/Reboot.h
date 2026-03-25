#pragma once
#include <Arduino.h>

class Reboot {
    public:
        explicit Reboot(uint32_t timeoutMs = 4000);

        void begin();
        void feed(); // call in loop() to auto-reboot if needed

    private:
        uint32_t _timeout;
};