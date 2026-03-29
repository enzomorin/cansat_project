#include "Jack_Plug.h"

Jack_Plug* Jack_Plug::_instance = nullptr;

Jack_Plug::Jack_Plug(uint8_t pin)
    : _pin(pin)
{}

void Jack_Plug::begin() {
    _instance = this;
    pinMode(_pin, INPUT_PULLUP);

    // Check state at boot — this is the initial block
    _blocked = (digitalRead(_pin) == LOW);
    _locked  = false;

    attachInterrupt(digitalPinToInterrupt(_pin), _isr, CHANGE);
}

void Jack_Plug::lockIn() {
    // Called when telemetry starts freeze the blocked state
    // Any future jack insertion (water contact) will be ignored
    _locked = true;
}

void Jack_Plug::_isr() {
    bool jackIn = (digitalRead(_instance->_pin) == HIGH);

    if (!jackIn) {
        // Jack removed always unblock, even if locked
        _instance->_blocked = false;
    } else if (!_instance->_locked) {
        // Jack inserted AND not yet locked → block
        // If locked (mission running) ignore water contact
        _instance->_blocked = true;
    }
}