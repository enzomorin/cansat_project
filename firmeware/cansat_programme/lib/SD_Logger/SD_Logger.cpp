#include "SD_Logger.h"
#include <string.h>
#include <stdlib.h>

namespace {
    constexpr uint16_t CMD_DELAY_MS  = 120;
    constexpr uint16_t PROMPT_DELAY_MS = 2000;
    constexpr uint16_t BOOT_TIMEOUT_MS   = 5000; // max wait for boot prompt
    constexpr uint16_t ESCAPE_GAP_MS = 10;   // gap between Ctrl+Z chars 
}

SD_Logger::SD_Logger(HardwareSerial& serial)
    :_serial(serial) {}

bool SD_Logger::begin(uint32_t baud) {
    _serial.begin(baud);
    delay(500);
    sendEscape();

    waitFor('>', BOOT_TIMEOUT_MS); // time to boot
    DrainRX();

    createMissionFile(); // based on config 2 for command and 1 Sequential Log and 0 to create a new file
    writeHeader();

    _ready = true;
    return true;
}

void SD_Logger::createMissionFile() {
    snprintf(_currentFile, sizeof(_currentFile), "MISSION.CSV");

    _serial.print("new ");
    _serial.print(_currentFile);
    _serial.write('\r');
    waitFor('>', PROMPT_DELAY_MS);
    DrainRX();

    _serial.print("append ");
    _serial.print(_currentFile);
    _serial.write('\r');
    waitFor('<', PROMPT_DELAY_MS);
    DrainRX();
}

void SD_Logger::writeHeader() {
    startLine();

    addField("time_s");
    addField("temperature_C");
    addField("pressure_hPa");
    addField("altitude_m");
    addField("water_kPa");
    addField("water_depth_m");
    addField("rpm");

    endLine();
}

void SD_Logger::startLine() {
    _index = 0;

    _overflow = false;
}

void SD_Logger::endLine() {
    if (!_overflow && _index < BUFFER_SIZE - 1 ) { // -1 bytes for the \n
        _buffer[_index++] = '\n';
    }

    _serial.write((uint8_t*)_buffer, _index);
}

void SD_Logger::addField(const char* field) {
    addField(field, strlen(field));
}

void SD_Logger::addField(const char* field, size_t len) {
    if (_overflow) return;

    // add comma
    if (_index > 0) {
        if (_index >= BUFFER_SIZE - 1) { _overflow = true; return; }
        _buffer[_index++] = ',';
    }


    if (_index + len >= BUFFER_SIZE) { _overflow = true; return; }
    memcpy(&_buffer[_index], field, len);
    _index += len;
}

inline void SD_Logger::addChar(char c) {
    if (_index < BUFFER_SIZE) _buffer[_index++] = c;
    else _overflow = true;
}

void SD_Logger::addInt(int32_t value) {
    if (_overflow) return;

    char tmp[12];
    itoa(value, tmp, 10);
    addField(tmp);
}

void SD_Logger::addFloat(float value, uint8_t precision) {
    if (_overflow) return;

    // Handle negative
    if (value < 0.0f) {
        addChar('-');
        value = -value;
    }

    // Integer part
    int32_t intPart = (int32_t)value;
    char tmp[12];
    itoa(intPart, tmp, 10);
    size_t tlen = strlen(tmp);

    // integer part
    if (_index > 0) {
        if (_index >= BUFFER_SIZE - 1) { _overflow = true; return; }
        _buffer[_index++] = ',';
    }
    if (_index + tlen >= BUFFER_SIZE) { _overflow = true; return; }
    memcpy(&_buffer[_index], tmp, tlen);
    _index += tlen;

    if (precision == 0) return;
    addChar('.');

    float frac = value - (float)intPart;
    for (uint8_t i = 0; i < precision; i++) {
        frac *= 10.0f;
        if (frac < 0.0f) frac = 0.0f;
        uint8_t digit = (uint8_t)frac;
        addChar('0' + digit);
        frac -= (float)digit; 
        if (frac < 0.0f) frac = 0.0f;
    }
}

void SD_Logger::flush() {
    sendEscape();
    waitFor('>', PROMPT_DELAY_MS);
    DrainRX();

    _serial.print("sync\r");
    waitFor('>', PROMPT_DELAY_MS);
    DrainRX();

    // Re-enter streaming
    _serial.print("append ");
    _serial.print(_currentFile);
    _serial.write('\r');
    waitFor('<', PROMPT_DELAY_MS);
    DrainRX();
}

void SD_Logger::sendEscape() {
    // Ctrl+Z x3 exits append mode, returns to '>'
    _serial.write(26); delay(ESCAPE_GAP_MS);
    _serial.write(26); delay(ESCAPE_GAP_MS);
    _serial.write(26);
    delay(CMD_DELAY_MS); // wait for '>' to be ready
}

void SD_Logger::DrainRX() {
    delay(50);
    while (_serial.available()) _serial.read();
}

bool SD_Logger::waitFor(char c, uint16_t timeoutMs) {
    uint32_t start = millis();
    while (millis() - start < timeoutMs) {
        if (_serial.available() && (char)_serial.read() == c)
            return true;
    }
    return false;
}

inline void SD_Logger::wait(uint32_t ms) {
    uint32_t _start = millis();
    while (millis() - _start < ms) {}
}