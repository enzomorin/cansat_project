#include "BME_280.h"
#include <Wire.h>

BME_280::BME_280(uint8_t i2cAddress, float seaLevelPressure, uint32_t retryIntervalMs, uint32_t timeoutMs)
    : _i2cAddress(i2cAddress)
    , _seaLevelPressure(seaLevelPressure)
    , _retryIntervalMs(retryIntervalMs)
    , _timeoutMs(timeoutMs)
    , _ready(false)
{}

bool BME_280::_tryInit() {
    return _bme.begin(_i2cAddress, &Wire);
}

bool BME_280::begin() {
    uint32_t start = millis();

    while (millis() - start < _timeoutMs) {
        if (_tryInit()) {
            _ready = true;
            return true;
        }
        delay(_retryIntervalMs);
    }

    _ready = false;
    return false;
}

bool BME_280::update() {
    if (!_ready) return false;

    // BME280 updates automatically — just validate next read
    BMEData d = readALL();
    return d.valid;
}

bool BME_280::ready() const {
    return _ready;
}

bool BME_280::_validateData(const BMEData& d) const {
    // Sanity ranges — catches sensor not connected or returning garbage
    if (d.temperature < -40.0f || d.temperature > 85.0f)  return false;
    if (d.pressure    < 300.0f || d.pressure    > 1100.0f) return false;
    if (d.altitude    < -500.0f || d.altitude   > 9000.0f) return false;
    return true;
}

BMEData BME_280::readALL() {
    BMEData d;

    if (!_ready) {
        d.valid = false;
        return d;
    }

    d.temperature = _bme.readTemperature();
    d.pressure    = _bme.readPressure() / 100.0f; // Pa → hPa
    d.altitude    = _bme.readAltitude(_seaLevelPressure);
    d.valid       = _validateData(d);

    return d;
}