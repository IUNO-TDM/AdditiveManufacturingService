FROM node:boron
RUN npm install pm2 -g

# Configure log rotate

RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:retain 10


# Create app directory

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source

COPY AdditiveManufacturingService-app /usr/src/app

# Install app dependencies
RUN npm install

EXPOSE 3007

CMD [ "pm2-docker", "npm", "--", "start" ]