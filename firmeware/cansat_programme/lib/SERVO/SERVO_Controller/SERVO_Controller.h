#pragma once
#include <Arduino.h>
#include <Servo.h>

class SERVO_Controller {
    public:
        explicit SERVO_Controller(uint8_t pin, uint8_t limit = 180);

        // Initialize the servo (attach pin)
        void begin();

        // Set servo position (0-180)
        void setPosition(int angPos);

        // Get the last set position
        uint8_t getPosition() const;
    private:
        Servo _servo;
        uint8_t _pin;
        uint8_t _angPos = 0;
        uint8_t _base = 0;
        uint8_t _limit = 180;
};