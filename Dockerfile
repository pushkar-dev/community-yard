FROM node:lts-alpine3.18
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app 
    # && mkdir -p /root/.ssh \
    # && chmod 0700 /root/.ssh \
    # && passwd -u root \
    # && echo "$ssh_pub_key" > /root/.ssh/authorized_keys \
    # && apk add openrc openssh \
    # && ssh-keygen -A \
    # && echo -e "PasswordAuthentication no" >> /etc/ssh/sshd_config \
    # && mkdir -p /run/openrc \
    # && touch /run/openrc/softlevel
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "node", "app.js" ]