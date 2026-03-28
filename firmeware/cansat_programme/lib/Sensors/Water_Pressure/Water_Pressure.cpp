#include "Water_Pressure.h"

Water_Pressure::Water_Pressure(
    uint8_t         pin,
    WaterSensorMode mode,
    uint16_t        adcResolution,
    float           vRef
)
    : _pin(pin)
    , _mode(mode)
    , _adcResolution(adcResolution)
    , _vRef(vRef)
    , _offset(0.0f)
{}

bool Water_Pressure::begin() {
    analogReadResolution(12); // force 12-bit on nRF52840

    uint32_t sum = 0;
    for (uint8_t i = 0; i < 32; i++) {
        sum += analogRead(_pin);
    }
    uint16_t avgRaw = sum / 32;

    // If raw is 0 or maxed out → sensor not connected
    if (avgRaw < 10 || avgRaw > 4085) return false;

    // Convert averaged raw to voltage once
    _offset = (avgRaw / (float)_adcResolution) * _vRef;
    if (_mode == WaterSensorMode::DIVIDED) {
        _offset /= DIVIDER_RATIO;
    }

    return true;
}

float Water_Pressure::_smoothed() {
    uint32_t sum = 0;
    for (uint8_t i = 0; i < 16; i++) {
        sum += analogRead(_pin);
    }
    uint16_t avgRaw = sum / 16;

    float adcV = (avgRaw / (float)_adcResolution) * _vRef;
    return (_mode == WaterSensorMode::DIVIDED) ? adcV / DIVIDER_RATIO : adcV;
}

bool Water_Pressure::_validateData(const WaterPressureData& d) const {
    if (d.pressureKPa < -10.0f  || d.pressureKPa > 1200.0f) return false;
    if (d.depthM      <  -1.0f  || d.depthM      >  120.0f) return false;
    return true;
}

WaterPressureData Water_Pressure::read(float atmPressureHPa) {
    WaterPressureData d;

    d.raw = analogRead(_pin);

    float V = _smoothed();

    // DFRobot formula: P(kPa) = (V - offset) × 250
    d.pressureKPa = (V - _offset) * 250.0f;

    // Depth via BME delta pressure
    float waterPa = d.pressureKPa * 1000.0f; // kPa → Pa
    float atmPa = atmPressureHPa * 100.0f; // hPa → Pa
    float deltaPa = waterPa - atmPa;
    d.depthM = constrain(deltaPa / (1000.0f * 9.80665f), 0.0f, 120.0f);

    d.valid = _validateData(d);
    return d;
}