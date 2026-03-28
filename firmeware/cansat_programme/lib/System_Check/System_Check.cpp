#include "System_Check.h"

void System_Check::checkBME(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::BME;
}

void System_Check::checkWater(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::WATER;
}

void System_Check::checkHall(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::HALL;
}

void System_Check::checkServo(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::SERVO;
}

void System_Check::checkSD(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::SD;
}

void System_Check::checkScreen(bool beginResult) {
    if (!beginResult) _status |= SystemStatus::SCREEN;
}