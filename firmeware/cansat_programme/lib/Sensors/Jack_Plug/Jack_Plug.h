#pragma once
#include <Arduino.h>

class Jack_Plug {
    public:
        explicit Jack_Plug(uint8_t pin);

        void begin();
        void lockIn();

        bool isBlocked() const { return _blocked; }

    private:
        uint8_t          _pin;
        volatile bool    _blocked = false;
        volatile bool    _locked  = false; // true = ignore future locked 

        static Jack_Plug* _instance;
        static void       _isr();
};