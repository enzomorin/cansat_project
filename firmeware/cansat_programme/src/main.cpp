#include <Arduino.h>
#include <SD_Logger.h>
#include <SPI_Radio.h>
#include <SERVO_Controller.h>
#include <SERVO_Logic.h>
#include <Sensors.h>
#include <System_Check.h>
#include "config.h"

// Objects
SD_Logger SD(Serial1);

SERVO_Controller servo(Pins::SERVO);
SERVO_Logic servoLogic(servo, Timings::SERVO_LOGIC_DELAY_MS);

constexpr System_Check::Config checkConfig = {
    .servoPin = Pins::SERVO,
    .sdSerial = &Serial1
};

System_Check systemCheck(checkConfig);

// Runtime state
uint32_t counter = 0;

uint32_t lastServo = 0;
uint32_t lastLog   = 0;
uint32_t lastFlush = 0;

enum class ServoState : uint8_t {
    PARACHUTE,
    WATER
};

ServoState servoState = ServoState::PARACHUTE;

void setup() {
    Serial.begin(115200);

    SD.begin(9600);

    const uint8_t status = systemCheck.run();
    if (status != System_Check::OK) {
        Serial.print("system check failed at 0x");
        Serial.println(status, HEX);
    }

    servo.begin();
}

void loop() {
    const uint32_t now = millis();

    if (now - lastServo >= Timings::SERVO_PERIOD_MS) { // give servo time to move
        lastServo = now;

        if (servoState == ServoState::PARACHUTE) {
            servoLogic.update(false);
            servoState = ServoState::WATER;
        } else {
            servoLogic.update(true);
            servoState = ServoState::PARACHUTE;
        }
    }

    // SD logging
    if (now - lastLog >= Timings::LOG_PERIOD_MS) {
        lastLog = now;

        SD.startLine();
        SD.addInt(counter++);
        SD.addField("TEMP");
        SD.endLine();
    }

    // to prevent crash we put the buffer data in the SDcard every 10 seconds
    if (now - lastFlush >= Timings::FLUSH_PERIOD_MS) {
        lastFlush = now;
        SD.flush();
    }
}