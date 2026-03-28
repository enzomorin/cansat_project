#include "Screen.h"
#include <Wire.h>

Screen::Screen(uint8_t resetPin, uint8_t i2cAddress):
    _i2cAddress(i2cAddress),
    _display(resetPin)
{}

bool Screen::begin() {
    Wire.begin();

    if (!_display.begin(SSD1306_SWITCHCAPVCC, _i2cAddress)) return false;

    _display.clearDisplay();
    _display.setTextColor(WHITE);
    _display.setTextSize(1);

    return true;
}

void Screen::showDefaultText() {
    _display.clearDisplay();

    _display.setCursor(23, 0);
    _display.println("OLED - Display");

    _display.setCursor(23, 12);
    _display.println("www.joy-it.net");

    _display.setCursor(36, 24);
    _display.println("SBC-OLED01");

    _display.display();
}

void Screen::showText(const char* c) {
    _display.clearDisplay();

    _display.setCursor(23, 0);
    _display.println(c);

    _display.display();

    delay(500);
}

void Screen::invert(bool state) {
    _display.invertDisplay(state);
}