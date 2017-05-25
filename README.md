# FinBel ECG #
International cooperation project between Electronics-ICT faculty of Artesis Plantijn University College, Antwerp, Belgium and  of Oulu University of Applied Sciences, Finland. 

The Finnish students (Marko Yuljukulju and Veli-Pekka Porassalmi) have build a prototype device to wear on the chest to measure the heart beatings. 
The Belgian students (Chingiz Mizambekov and Steven Dijcks) have build a web application to process the data generated by the device.

# Web Application (Software) #

## Foreword ##
The webapp is based on the MEAN stack with local MongoDB instance and is run on the Raspberry Pi


## The features of the webapp and how to use it ##
	* Create a profile
	* Login to personalized dashboard (start session)
		* View profile info
		* Upload new record (.json generated by the hardware)
		* Display ECG records (charts and analysis of the data)
		* Grant accountless and passwordless access to your doctor by generating a link with the "Share with your doctor" button in the "Display graphs" section. The link contains your userID and a temporary access token
		* Logout (terminate session)
	* About section
	* Contact form to contact the product owners
	* List of nearby hospitals in Antwerp
	* Donate function to buy the developers a drink (not implemented yet)

## Deployment ##
There are 3 possibilities to deploy the app from the repo:
1. Manual 
	Download the repo
	Run "npm install"
	Make sure there is a mongo server running on the local machine
	Start the app with "forever start server.js"
2. Set up a virtual machine with Vagrant
	Make sure Vagrant and Virtual Box are installed
	Run "vagrant up" from the rootfolder of the repo
	The web app is accessible at 192.168.50.3
3. For MacOS or Linux
	Make sure Docker is installed
	Run "docker-compose up -d" from the rootfolder of the repo
	The web app is accessible at 172.17.0.3


# Hardware #
## Arduino sketch ##

## Schematics ##

## PCB Design ##

## List of components ##