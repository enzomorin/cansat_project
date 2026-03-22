#include "SERVO_Controller.h"

SERVO_Controller::SERVO_Controller(uint8_t pin, uint8_t limit)
    :_pin(pin), _limit(limit) {}

void SERVO_Controller::begin() {
    _servo.attach(_pin);

    _servo.write(_base);
}

void SERVO_Controller::setPosition(int angPos) {
    if (angPos < _base) angPos = _base;
    if (angPos > _limit) angPos = _limit;

    _angPos = angPos;

    _servo.write(_angPos);
}

uint8_t SERVO_Controller::getPosition() const {
    return _angPos;
}