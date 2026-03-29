#include <Arduino.h>
#include <Screen.h>
#include <SD_Logger.h>
#include <SPI_Radio.h>
#include <SERVO_Controller.h>
#include <SERVO_Logic.h>
#include <Sensors.h>
#include <Button_Logic.h>
#include <Buzzer_Logic.h>
#include <System_Check.h>
#include "config.h"

// Objects
Screen display(Pins::DISPLAY_RST, Pins::DISPLAY_ADDR);
SD_Logger SD(Serial1);
SERVO_Controller servo(Pins::SERVO);
SERVO_Logic servoLogic(servo, Timings::SERVO_LOGIC_DELAY_MS);
BME_280 bme(Pins::BME_ADDR, Mission::SEA_LEVEL_PRESSURE_HPA, BMEConfig::RETRY_INTERVAL_MS, BMEConfig::TIMEOUT_MS ); // local sea level pressure
Water_Pressure water(Pins::WATER_PRESSURE, WaterSensorMode::DIRECT, WaterConfig::WATER_ADC_RESOLUTION, WaterConfig::VREF);
Hall_Sensor hall(Pins::HALL_SENSOR);
Jack_Plug jack(Pins::JACK_PLUG);
Button_Logic button(Pins::BUTTON);
Buzzer_Logic buzzer(Pins::BUZZER);
System_Check systemCheck;

// Runtime state
uint32_t counter = 0;
uint32_t lastServo = 0;
uint32_t lastLog   = 0;
uint32_t lastFlush = 0;

enum class ServoState : uint8_t { PARACHUTE, WATER };
ServoState servoState = ServoState::PARACHUTE;

void setup() {
    SD.begin(9600);

    systemCheck.checkSD (SD.isReady());
    systemCheck.checkScreen(display.begin());
    systemCheck.checkBME (bme.begin());
    systemCheck.checkWater (water.begin());

    jack.begin();
    jack.lockIn();
    hall.begin();
    button.begin();
    buzzer.begin();
    servo.begin();

    // Report
    if (!systemCheck.ok()) {
        char msg[24];
        snprintf(msg, sizeof(msg), "ERR 0x%02X", systemCheck.status());
        display.showText(msg);
        buzzer.error(systemCheck.status());
        delay(3000);
    } else {
        display.showText("All OK");
        buzzer.bootOk();
        delay(2000);
    }
}

void loop() {
    if (jack.isBlocked()) {
        static uint32_t lastJackBeep = 0;
        uint32_t now = millis();

        display.showText("Remove jack\nto telemetry :)");

        if (now - lastJackBeep >= 2000) {
            lastJackBeep = now;
            buzzer.jackBlocked();
        }

        // return;
    }

    button.read();
    // Detect if button pressed show on screen once
    static bool telemetryWasActive = true;
    if (button.telemetryActive() != telemetryWasActive) {
        telemetryWasActive = button.telemetryActive();

        if (button.telemetryActive()) { // ← mission started, ignore future jack insertions
            jack.lockIn();
            buzzer.telemetryOn();
            display.showText("Telemetry ON");
        } else {
            buzzer.telemetryOff();
            display.showText("Telemetry OFF");
        }
    }

    if (!button.telemetryActive()) {
        display.showText("Telemetry OFF");
        return;
    }

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
        WaterPressureData waterData = water.read();
        float rpmVal = hall.getRPM();

        static char logStr[64];
        snprintf(logStr, sizeof(logStr),
            "#%lu T:%.1f P:%.0f\nA:%.0f W:%.1f\nD:%.2f RPM:%.0f",
            counter,
            bmeData.valid ? bmeData.temperature    : -999.0f,
            bmeData.valid ? bmeData.pressure        : -999.0f,
            bmeData.valid ? bmeData.altitude        : -999.0f,
            waterData.valid ? waterData.pressureKPa   : -999.0f,
            waterData.valid ? waterData.depthM        : -999.0f,
            rpmVal
        );
        display.showText(logStr);

        SD.startLine();
        SD.addInt(counter++);
        SD.addFloat(bmeData.valid ? bmeData.temperature   : -999.0f, 2);
        SD.addFloat(bmeData.valid ? bmeData.pressure      : -999.0f, 2);
        SD.addFloat(bmeData.valid ? bmeData.altitude      : -999.0f, 2);
        SD.addFloat(waterData.valid ? waterData.pressureKPa : -999.0f, 2);
        SD.addFloat(waterData.valid ? waterData.depthM      : -999.0f, 2);
        SD.addFloat(rpmVal, 1);
        SD.endLine();

        buzzer.logTick();
    }

    // to prevent crash we put the buffer data in the SDcard every 10 seconds
    if (now - lastFlush >= Timings::FLUSH_PERIOD_MS) {
        lastFlush = now;

        SD.flush();
    }
}