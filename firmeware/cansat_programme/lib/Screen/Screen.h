#pragma once

#include <Arduino.h>
#include <Adafruit_SSD1306.h>

class Screen {
    public:
        Screen(uint8_t resetPin, uint8_t i2cAddress);
        bool begin();
        void showDefaultText();
        void invert(bool state);
        void showText(const char* c);

    private:
        uint8_t _i2cAddress;
        Adafruit_SSD1306 _display;
};