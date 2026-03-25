#include "SERVO_Logic.h"

SERVO_Logic::SERVO_Logic(SERVO_Controller& servo, unsigned long parachuteDelayMs)
    :_servo(servo), _parachuteDelayMS(parachuteDelayMs)
{
    _stateTime = millis();
}

void SERVO_Logic::update(bool inWater) {
    unsigned long now = millis();

    switch (_state) {
        case State::IDLE:
            if (now - _stateTime >= _parachuteDelayMS) {
                _servo.setPosition(PARACHUTE_POS);
                _state = State::PARACHUTE;
                _stateTime = now;
            }
            break;

        case State::PARACHUTE:
            if (inWater && now - _stateTime >= _parachuteDelayMS) {
                _servo.setPosition(ANCHOR_POS);
                _state = State::ANCHOR;
                _stateTime = now;
            }
            break;

        case State::ANCHOR:
            break;
    }
}