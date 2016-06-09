FROM mhart/alpine-node:6.2

RUN apk add --no-cache libc6-compat && rm -rf /var/cache/apk/* /root/.cache

RUN adduser -D runner

# Copy project files
COPY server.js package.json /home/runner/

# Copy the protofile to the apibricks location /api/main.proto
COPY xkcd.proto /api/main.proto

RUN chown -R runner /home/runner

WORKDIR /home/runner/
USER runner
RUN npm install

CMD ["node", "server.js"]
