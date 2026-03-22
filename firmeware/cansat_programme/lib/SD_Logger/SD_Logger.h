#pragma once
#include <Arduino.h>

class SD_Logger {
    public:
        explicit SD_Logger(HardwareSerial& serial);

        void begin(uint32_t baud = 115200);

       // CSV building
        void startLine();
        void addField(const char* field);
        void addField(const char* field, size_t len);
        void endLine();

        // Optional i think
        void flush();
    private:
        HardwareSerial& _serial;

        static constexpr size_t BUFFER_SIZE = 128;
        char _buffer[BUFFER_SIZE];
        size_t _index = 0;

        bool _overflow = false;
};