const char* host = "api.thingspeak.com";
String url = "/update?api_key=Q4IGKMSW9NHNL2JB";   // Your Own Key here
const int httpPort = 80;

const char* host_server = "118.33.117.28";
const int httpPort_server = 3002;

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <OneWire.h> 
#include <DallasTemperature.h>
 
#define ONE_WIRE_BUS D4   //  <------------------------
 
const char* ssid = "405";   // Your own ssid here
const char* password = "qwe123!@";  // Your own password here
OneWire oneWire(ONE_WIRE_BUS); 
DallasTemperature sensors(&oneWire);
 
void setup(void) 
{ 
 // start serial port 
 Serial.begin(115200); 
 Serial.println("Dallas Temperature IC Control Library Demo"); 
 WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }
 Serial.print("\n Got WiFi, IP address: ");
 Serial.println(WiFi.localIP());  
 sensors.begin(); 
}
 
char temperatureString[6];
void loop(void) 
{ 
 sensors.requestTemperatures();
 float temperature = sensors.getTempCByIndex(0);
 dtostrf(temperature, 2, 2, temperatureString);
 Serial.print("Temperature : ");
 Serial.println(temperatureString);
 WiFiClient client;
 
 Serial.print("Connecting to host : ");
 Serial.println(host);
 if (!client.connect(host, httpPort)) {
   Serial.print("connection fail");
   return;
 }
 Serial.print("connection success");
 client.print(String("GET ") + url + "&field1=" + temperatureString + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
              

 Serial.print("\nConnecting to host : ");
 Serial.println(host_server);

 if (!client.connect(host_server, httpPort_server)) { Serial.println("connection fail"); return; }
 Serial.print("connection success\n");
 client.print(String("GET ") + "/getdata?temp=" + temperatureString + " HTTP/1.1\r\n" + "Host: " + host_server+ "\r\n" + "Connection: close\r\n\r\n");
 
 Serial.print("Done cycle.\n\n");
 delay(60000);
} 
