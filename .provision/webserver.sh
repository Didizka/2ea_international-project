#!/usr/bin/env bash


#Install nginx
echo $'\e[32;1mInstalling Nginx\033[0m'
apt-get update
apt-get upgrade -y
apt-get install nginx -y
service nginx start

#Install git
echo $'\e[32;1mInstalling Git\033[0m'
apt-get install git -y

#Setup nginx
echo $'\e[32;1mCopying nginx config file\033[0m'
rm /etc/nginx/sites-available/default
rm /etc/nginx/sites-enabled/default
cp /vagrant/.provision/ecg.conf /etc/nginx/sites-available/ecg
cd /etc/nginx/sites-enabled
ln -s ../sites-available/ecg 
service nginx restart

	
###Install MEAN Stack
#Install MongoDB
echo $'\e[32;1mInstalling MongoDB\033[0m'
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
apt-get update
apt-get install -y mongodb-org
service mongod start

#Installing Node
echo $'\e[32;1mInstalling Node\033[0m'
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install -y nodejs
apt-get install build-essential
npm install -g bower
npm install -g gulp gulp-cli
npm install -g nodemon

# Setup ECG project
if [ ! -d /var/www/ecg ]
then
	# Book project
	cd /var/www
	ln -s /vagrant/ ecg
	cd /var/www/ecg
	git pull https://ChingizMizambekov@bitbucket.org/ChingizMizambekov/ecg.git
	npm install
	echo $'\e[32;1mECG project created, making symlink to synced folder and pulling last updates from BitBucket\033[0m'
else
	cd /var/www/ecg
	git pull https://ChingizMizambekov@bitbucket.org/ChingizMizambekov/ecg.git
	npm install
	#node server.js
	echo $'\e[32;1mECG project exists, pulling last version from BitBucket\033[0m'
fi


