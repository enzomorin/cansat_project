#pragma once
#include "../SERVO_Controller/SERVO_Controller.h"
#include <Arduino.h>

class SERVO_Logic {
    public:
        explicit SERVO_Logic(SERVO_Controller& servo, unsigned long parachuteDelayMs = 5000);
        
        void update(bool inWater);
    private:
        SERVO_Controller& _servo;

        enum class State : uint8_t {
            IDLE,
            PARACHUTE,
            ANCHOR
        };

        State _state = State::IDLE;

        unsigned long _stateTime = 0;
        unsigned long _parachuteDelayMS = 5000;

        static constexpr uint8_t PARACHUTE_POS = 90;
        static constexpr uint8_t ANCHOR_POS = 180;
};