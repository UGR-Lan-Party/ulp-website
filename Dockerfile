FROM nginx:alpine@sha256:892bb2152464f0c5d8972593a5f5afaf8054552580b699d95f8ff4af08c2d33d AS nginx-base
RUN apk upgrade --no-cache

FROM node:24.22.1-alpine AS node-builder

WORKDIR /app
RUN npm install --global pnpm@10.34.7
COPY package.json pnpm-lock.yaml .npmrc ./
COPY patches ./patches
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ARG VCS_REF=local
RUN node --input-type=module -e "import {writeFileSync} from 'node:fs';writeFileSync('dist/version.json', JSON.stringify({commit:process.env.VCS_REF})+'\n');"

FROM nginx-base AS nginx-runtime
ARG VCS_REF=local
LABEL org.opencontainers.image.source="https://github.com/UGR-Lan-Party/ulp-website"
LABEL org.opencontainers.image.revision=$VCS_REF
COPY --from=node-builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./security-headers.conf /etc/nginx/security-headers.conf
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/version.json || exit 1
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
