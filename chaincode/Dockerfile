#
# SPDX-License-Identifier: Apache-2.0
#
FROM node:18.19.0 AS builder

WORKDIR /usr/src/app

# Copy package.json and yarn.lock separately to leverage Docker cache
COPY --chown=node:node package.json yarn.lock ./
ENV YARN_CACHE_FOLDER=/usr/src/app/.yarn_cache
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY --chown=node:node . .

RUN yarn build


FROM node:18.19.0 AS dependencies

WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install only production dependencies
COPY --chown=node:node package.json yarn.lock ./
ENV YARN_CACHE_FOLDER=/usr/src/app/.yarn_cache
RUN yarn install --production --frozen-lockfile && yarn cache clean


FROM node:18.19.0 AS production
ARG CC_SERVER_PORT

# Setup tini to better handle signals
ENV TINI_VERSION v0.19.0
ENV PLATFORM=amd64
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-${PLATFORM} /tini
RUN chmod +x /tini

WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json 
COPY --chown=node:node --from=builder /usr/src/app/yarn.lock ./yarn.lock
COPY --chown=node:node --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --chown=node:node docker/docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh

ENV PORT $CC_SERVER_PORT
EXPOSE $CC_SERVER_PORT
ENV NODE_ENV=production
RUN ln -snf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && echo Asia/Ho_Chi_Minh > /etc/timezone

RUN chmod +x /usr/src/app/docker-entrypoint.sh
USER node
ENTRYPOINT [ "/tini", "--", "/usr/src/app/docker-entrypoint.sh" ]