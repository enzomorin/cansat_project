#pragma once

#include <Arduino.h>

struct WaterPressureData {
    float pressureKPa;  // KPa
    float depthM;       // meters of water depth
    int raw;            // raw for debug
    bool valid;
};

enum class WaterSensorMode : uint8_t {
    DIRECT,   // 3.3V direct — no voltage divider
    DIVIDED   // 5V supply with voltage divider (R1=10k, R2=27k)
};

class Water_Pressure {
    public:
        explicit Water_Pressure(
            uint8_t          pin           = A0,
            WaterSensorMode  mode          = WaterSensorMode::DIRECT,
            uint16_t         adcResolution = 4096,  // 12-bit nRF52840
            float            vRef          = 3.3f
        );

        bool begin();

        WaterPressureData read(float atmPressureHPa = 1013.25f);

        float getOffset() const { return _offset; }

    private:
        uint8_t         _pin;
        WaterSensorMode _mode;
        uint16_t        _adcResolution;
        float           _vRef;
        float           _offset;

        // Divider (R1=10k, R2=27k)
        static constexpr float DIVIDER_RATIO = 27.0f / (10.0f + 27.0f); // 0.7297

        float _smoothed();
        bool  _validateData(const WaterPressureData& d) const;
};