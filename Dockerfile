FROM node:latest
MAINTAINER Chingiz Mizambekov 

RUN mkdir -p /ecg
WORKDIR /ecg

COPY package.json /ecg/package.json
COPY . /ecg


EXPOSE 3000


CMD ["npm", "start"]

