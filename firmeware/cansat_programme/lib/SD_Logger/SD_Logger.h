#pragma once

#include <Arduino.h>

class SD_Logger {
    public:
        explicit SD_Logger(HardwareSerial& serial);

        void begin(uint32_t baud);

        // CSV building
        void startLine();
        void endLine();

        void addInt(int32_t value);
        void addFloat(float value, uint8_t precision = 2);

        void addField(const char* field);
        void addField(const char* field, size_t len);

        // Optional i think
        void flush();
        
    private:
        HardwareSerial& _serial;

        // File management
        void createMissionFile();
        void writeHeader();

        uint16_t _missionID = 0;

        char _currentFile[13];

        static constexpr size_t BUFFER_SIZE = 256;
        char _buffer[BUFFER_SIZE];
        size_t _index = 0;

        bool _overflow = false;

        inline void addChar(char c);

        inline void sendEscape();

        inline void DrainRX();

        bool waitFor(char c, uint16_t timeoutMs);

        inline void wait(uint32_t ms);
};