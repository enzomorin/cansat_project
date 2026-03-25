#include "BME_280.h"
#include <Wire.h>

BME_280::BME_280(uint8_t i2cAddress, float seaLevelPressure, uint32_t retryIntervalMs, uint32_t timeoutMs)
    :_i2cAddress(i2cAddress)
    ,_seaLevelPressure(seaLevelPressure)
    ,_retryIntervalMs(retryIntervalMs)
    ,_timeoutMs(timeoutMs)
    ,_ready(false)
{}

