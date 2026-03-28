#include <Arduino.h>
#include <Screen.h>
#include <SD_Logger.h>
#include <SPI_Radio.h>
#include <SERVO_Controller.h>
#include <SERVO_Logic.h>
#include <Sensors.h>
#include <Button_Logic.h>
#include <System_Check.h>
#include "config.h"

// Objects
Screen display(Pins::DISPLAY_RST, Pins::DISPLAY_ADDR);
SD_Logger SD(Serial1);
SERVO_Controller servo(Pins::SERVO);
SERVO_Logic servoLogic(servo, Timings::SERVO_LOGIC_DELAY_MS);
BME_280 bme(Pins::BME_ADDR, 1023.0f); // local sea level pressure
Water_Pressure water(Pins::WATER_PRESSURE, WaterSensorMode::DIRECT);
Hall_Sensor hall(Pins::HALL_SENSOR);
System_Check systemCheck;

// Runtime state
uint32_t counter = 0;

uint32_t lastServo = 0;
uint32_t lastLog   = 0;
uint32_t lastFlush = 0;

enum class ServoState : uint8_t { PARACHUTE, WATER };
ServoState servoState = ServoState::PARACHUTE;

void setup() {
    Serial.begin(115200);

    SD.begin(9600);

    systemCheck.checkSD (SD.isReady());
    systemCheck.checkScreen(display.begin());
    systemCheck.checkBME (bme.begin());
    systemCheck.checkWater (water.begin());

    hall.begin();
    servo.begin();

    // Report
    if (!systemCheck.ok()) {
        char msg[24];
        snprintf(msg, sizeof(msg), "ERR 0x%02X", systemCheck.status());
        Serial.println(msg);
        display.showText(msg);
        delay(3000);
    } else {
        display.showText("All OK");
        delay(2000);
    }
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

        BMEData bmeData = bme.readALL();
        WaterPressureData waterData = water.read(bmeData.valid ? bmeData.pressure : 1013.25f); // use standart if not data

        char logStr[64];
        snprintf(logStr, sizeof(logStr),
            "#%lu T:%.1f P:%.0f\nA:%.0f W:%.1f\nD:%.2f R:%d",
            counter,
            bmeData.valid ? bmeData.temperature    : -999.0f,
            bmeData.valid ? bmeData.pressure        : -999.0f,
            bmeData.valid ? bmeData.altitude        : -999.0f,
            waterData.valid ? waterData.pressureKPa   : -999.0f,
            waterData.valid ? waterData.depthM        : -999.0f,
            waterData.raw
        );
        display.showText(logStr);

        SD.startLine();
        SD.addInt(counter++);
        SD.addFloat(bmeData.valid ? bmeData.temperature   : -999.0f, 2);
        SD.addFloat(bmeData.valid ? bmeData.pressure      : -999.0f, 2);
        SD.addFloat(bmeData.valid ? bmeData.altitude      : -999.0f, 2);
        SD.addFloat(waterData.valid ? waterData.pressureKPa : -999.0f, 2);
        SD.addFloat(waterData.valid ? waterData.depthM      : -999.0f, 2);
        SD.endLine();
    }

    // to prevent crash we put the buffer data in the SDcard every 10 seconds
    if (now - lastFlush >= Timings::FLUSH_PERIOD_MS) {
        lastFlush = now;

        SD.flush();
    }
}