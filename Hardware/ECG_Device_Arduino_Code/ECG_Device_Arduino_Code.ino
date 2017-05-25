/*
 * Updates since 16.4.2017:
 *  -sample_count variable type --> long
 *  -Try to initialize sd card multiple times if not succeeded at the first try
 *  -Frequency is calculated correctly
 *  -JSON syntax fixes
 *  
 * Known issues 16.4.2017
 *  -Fetching measured data from temp file to "JSON" file takes forever... (>20min with 82k samples)
 *  -Missing the last } bracket from the json syntax...
 *  -Cannot create .json files, seems like the max length of the fileformat is 3 characters -> .jsn
 *  
 * Improvement ideas:
 *  -Setup ADCs' referece voltage for more accurate measurements
 *  -Use smaller SPI prescaler --> faster data write/read from SD card
 *  -Instead of reading every data samples from the temp_data file, read only neccessary files --> faster data write/read from SD card
*/


#include <SD.h>
#include <SPI.h>
#include <Wire.h>
#include "RTClib.h"

#define SD_CS_PIN       10
#define LEAD_A_PIN      A1
#define LEAD_B_PIN      A2
#define INTERRUPT_PIN   1
#define DATA_NAME_SIZE  13

volatile bool state = false;
uint8_t second, minute, hour, day, month;
uint16_t year;
uint8_t current_day;

//unsigned long sample_count = 82000; //Around 32 seconds of samples
unsigned long sample_count = 20500;  //Around 8 seconds of samples
//unsigned long sample_count = 41000; //Around 16 seconds of samples

unsigned long sampling_freq;

char temp_sample_file[] = "temp.txt";   //max 8 char before .txt and 7 before.json
char file_name[DATA_NAME_SIZE] = "";  //For example 16102017.json 

uint8_t measure_number = 1;

File sd;
File temp;
File test;
RTC_DS1307 rtc;


void sdSetup(){
  bool success;
  uint8_t i;
  for(i=1; i<4; i++){
    Serial.print("Initializing SD card. Attempt no: ");
    Serial.println(i);
    if(!SD.begin(SD_CS_PIN)){
      Serial.println("SD initialization failed!");
      delay(2000);
    } else{
      Serial.println("SD initialization completed!");
      i = 4;
    }
  }
}


void takeSamples(uint8_t leadA, uint8_t leadB){
  int data;
  uint8_t data_mapped;
  unsigned long start_time;
  double delta_time;
  
  Serial.println("Creating temporary data file...");
  temp = SD.open(temp_sample_file, FILE_WRITE);   //Create a temporary datafile into the SD card
  if(temp){
    Serial.println("File created and opened");
  } else Serial.println("Error opening/creating a file!");

  start_time = millis();    //Measure time, used for calculating avg sampling frequency
  
  for(long i=0; i<sample_count; i++){   //Take samples
    data = analogRead(leadA);
    data_mapped = map(data, 0, 1023, 0, 255);   //Map the data into 8-bits
    temp.write(data_mapped);
    data = analogRead(leadB);
    data_mapped = map(data, 0, 1023, 0, 255);
    temp.write(data_mapped);
  }

  delta_time = ((millis()-start_time)/1000.0)/sample_count;   //Calculate time consumed in seconds
  /*Serial.print("delta time: ");
  Serial.print(delta_time, 10);
  Serial.println("s");*/
  sampling_freq = 1/delta_time;   //Frequency = 1/Ts (Ts = time consumed while taking samples)
  if(temp){
    temp.close();
    Serial.println("File closed.");
  }
}


bool checkFile(char filename[]){    
  if(SD.exists(filename)){    //Check if file exists
    Serial.println(filename);
    Serial.println(" file found!");
    return 1;
  } else{
    Serial.println(filename);
    Serial.println(" file not found!");
    return 0;
  }
}


void deleteTempFile(char filename[]){
  if(checkFile(filename)){    //Check if file exists:
    Serial.println("Deleting temporary file...");
    SD.remove(filename);    //Delete file from SD card
    if(!checkFile(filename)){
      Serial.print(filename);
      Serial.println(" file deleted");
    } else {
      Serial.print(filename);
      Serial.println(" file not deleted");
    }
  }
}


void createJson(char filename[], uint8_t meas_num){
  uint8_t sample, modulo;
  char buf[2];
  long i, data_size;
  unsigned long start_time, delta_time;
  start_time = millis();  //Measure time consumed while creating .json file (not really needed, just informative)
  Serial.println("Creating JSON file...");
  sd = SD.open(filename, FILE_WRITE);
  if(sd){
    Serial.print(filename);
    Serial.println(" file created/opened.");
  } else Serial.println("Error opening/creating a file!");

  if (meas_num == 1) {
  sd.print("{\"measurement");
  sd.print(meas_num);
  } else {
    sd.print(",");
    sd.print("\"measurement");
    sd.print(meas_num);
  }

  sd.print("\":{\n\"day\":");
  sd.print(day);
  sd.print(",\n\"month\":");
  sd.print(month);
  sd.print(",\n\"year\":");
  sd.print(year);
  sd.print(",\n\"hour\":");
  sd.print(hour);
  sd.print(",\n\"minute\":");
  sd.print(minute);
  sd.print(",\n\"frequency\":");
  sd.print(sampling_freq);  //Average
  sd.print(",\n\"sensor1\":[");

 temp = SD.open(temp_sample_file);
 if(temp){
  Serial.print(temp_sample_file);
  Serial.println(" file opened.");
 }  else Serial.println("Error opening temp file");
 
  data_size = temp.size();
  /*Serial.print("datafile size: ");
  Serial.print(data_size);
  Serial.println("B");
  Serial.println("Data from datafile:");*/

  
//First sensor data to json:
  Serial.println("First sensor... ");
  for(i=1; i<(data_size+1); i++){
    sample = temp.read();
    modulo = i%2;
    if(modulo != 0){    //Write every other sample
      if(i < (data_size-1)){
        sd.print(sample);
        sd.print(",");
      } else {
        sd.print(sample);
      }
    }
  }
  temp.seek(0);   //Go back to the beginning of the temp_data file
  sd.print("],\n\"sensor2\":[");
 
//Second sensor data to json:
  Serial.println("Second sensor... ");
  for(i=1; i<(data_size+1); i++){
    sample = temp.read();
    modulo = i%2;
    if(modulo == 0){
      if(i < (data_size-1)){
        sd.print(sample);
        sd.print(",");
      } else {
        sd.print(sample);
      }
    }
   }
  sd.print("]}\n");
 // sd.print("}\n");
  sd.close();
  temp.close();
  Serial.println("JSON done!");
  delta_time = (millis()-start_time)/1000;
  Serial.print("Write JSON time: ");
  Serial.print(delta_time);
  Serial.println("sec");
  deleteTempFile(temp_sample_file);
}

void ISR0(){
  state = true;
}

void setupRTC(){
  if(!rtc.begin()){
    Serial.println("RTC not running!");
  }else Serial.println("RTC up and running!"); 
}

void getTime(){   //Get current time from RTC
  DateTime current = rtc.now();
  
  day = current.day();
  month = current.month();
  year = current.year();
  hour = current.hour();
  minute = current.minute();
  second = current.second();
}

void createFileName(){ 
  uint8_t i=0; 
  String filename;
  filename = String(day);
  filename = String(filename + month);
  filename = String(filename + year);
  filename = String(filename + ".jsn");
  filename.toCharArray(file_name, DATA_NAME_SIZE);
}


void setup(){
  Serial.begin(115200);
  pinMode(SD_CS_PIN, OUTPUT);
  //pinMode(SS, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(INTERRUPT_PIN), ISR0, RISING);
  //analogReference(INTERNAL);    //Set ADCs' reference voltage (not tested!)
  
  setupRTC();
  delay(1000);
  //rtc.adjust(DateTime(2017, 4, 20, 11, 56, 00));  //Setup RTC time if needed
  getTime();
  /*Serial.print(day);
  Serial.print(month);
  Serial.print(year);
  Serial.print(" ");
  Serial.print(hour);
  Serial.print(minute);
  Serial.println(second);
  */
  sdSetup();
  current_day = day;
  deleteTempFile(temp_sample_file); //Delete temp_data file if exists
}


void loop(){
  while(state){   //Wait for an interrupt
    detachInterrupt(ISR0);    //Disable interrupts
    Serial.println("interrupt");
    delay(3000);
    getTime();
    
    if(measure_number > 1 && day != current_day){   //Keep track of the MeasurementN parameter in .json file
      measure_number = 1;                 
    }
    
    takeSamples(LEAD_A_PIN, LEAD_B_PIN);    //Take samples
    
    /*Serial.print("Sampling frequency: ");
    Serial.print(sampling_freq);
    Serial.println("Hz");*/
    
    createFileName();   //Create filename
    
    Serial.print("Filename: ");
    Serial.println(file_name);
    
    createJson(file_name, measure_number);    //Create new .json file or open existing one
    measure_number++;
    current_day = day;
    delay(3000);
    attachInterrupt(digitalPinToInterrupt(INTERRUPT_PIN), ISR0, RISING);    //Enable interrupts
    state = false;
  }
}
