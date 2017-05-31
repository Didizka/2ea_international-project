FROM mongo
COPY mongodb-data.json /mongodb-data.json
CMD mongoimport --host db --port 27017 --db ecg --collection users --type json --file /mongodb-data.json --jsonArray

