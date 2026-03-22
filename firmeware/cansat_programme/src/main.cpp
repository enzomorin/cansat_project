#include <Arduino.h>
#include <System_Check.h>
#include <SD_Logger.h>
#include <SERVO.h>
#include "config.h"

SD_Logger SD(Serial1);
SERVO_Controller servo(Pins::SERVO, 180);
SERVO_Logic seroLogic(servo, 5000);
// for the servo and other with pins do Pins::SERVO for example

void setup() {
    SD.begin();
    servo.begin();
}

void loop() {
    servo.setPosition(90);
    SD.startLine();
    SD.addField("TEMP");
    SD.addField("23.5");
    SD.addField("1013");
    SD.endLine();

    delay(1000);
}