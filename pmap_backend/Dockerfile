FROM node:15.4.0
WORKDIR /opt/app
RUN chown -R node:node /opt/app

USER root
# RUN cd /opt/app && npm install -g sails@1.0.2 && npm install nodemon && npm install -g node-inspect
# RUN npm install -g sails@1.0.2
RUN npm install @sailshq/connect-redis@^3.2.1
RUN npm install @sailshq/lodash@^3.10.3
RUN npm install @sailshq/socket.io-redis@^5.2.0
RUN npm install assert@^2.0.0
RUN npm install async@2.0.1
RUN npm install axios@^0.19.2
RUN npm install bcryptjs@^2.4.3
RUN npm install csv-parser@^2.3.2
RUN npm install csv2json@^2.0.2
RUN npm install csvtojson@^2.0.10
RUN npm install event-stream@^4.0.1
RUN npm install fast-csv@^4.3.0
RUN npm install file-system@^2.2.2
RUN npm install fs-extra@^9.0.0
RUN npm install grunt@1.0.1
# RUN npm install mongodb@^3.3.3
RUN npm install node-gyp@^7.0.0
RUN npm install -g sails@^1.0.2
RUN npm install -g sails-hook-grunt@^3.0.2
RUN npm install -g sails-hook-orm@^2.0.0-16
RUN npm install -g sails-hook-sockets@^1.4.0
RUN npm install skipper@^0.8.7
RUN npm install sails-mongo

WORKDIR /app           
COPY . /app
# RUN npm install
# RUN npm install popper.js@^1.14.7 && npm install jquery@1.9.1 && npm install bootstrap@4.3.1

EXPOSE 1337
EXPOSE 9229