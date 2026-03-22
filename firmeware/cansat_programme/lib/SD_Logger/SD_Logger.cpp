#include "SD_Logger.h"
#include <string.h>

SD_Logger::SD_Logger(HardwareSerial& serial)
    :_serial(serial) {}

void SD_Logger::begin(uint32_t baud) {
    _serial.begin(baud);
}

void SD_Logger::startLine() {
    _index = 0;
    _buffer[0] = '\0';

    _overflow = false;
}

void SD_Logger::addField(const char* field) {
    addField(field, strlen(field));
}

void SD_Logger::addField(const char* field, size_t len) {
    if (_overflow) return;

    if (_index > 0) {
        if (_index < BUFFER_SIZE - 1) _buffer[_index++] = ','; // Add comma if needed
        else _overflow = true;
    }

    if (!_overflow && _index + len < BUFFER_SIZE) { // Check space for field
        memcpy(&_buffer[_index], field, len);

        _index += len; // Copy field

        _buffer[_index] = '\0'; // End string
    } else _overflow = true;
}

void SD_Logger::endLine() {
    if (!_overflow && _index < BUFFER_SIZE - 2 ) { // -2 bytes for the \n and \0
        _buffer[_index++] = '\n';
        
        _buffer[_index] = '\0';
    }

    _serial.print(_buffer);
}

void SD_Logger::flush() {
    _serial.flush();
}