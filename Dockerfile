FROM node:latest
MAINTAINER Chingiz Mizambekov 

RUN mkdir -p /ecg
WORKDIR /ecg

COPY package.json /ecg
COPY . /ecg
RUN npm install


EXPOSE 3000


CMD ["npm", "start"]

