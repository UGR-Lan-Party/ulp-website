FROM node:24.21.0-alpine AS node-builder

WORKDIR /app
RUN npm install --global pnpm@10.34.7
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ARG VCS_REF=local
RUN node --input-type=module -e "import {writeFileSync} from 'node:fs';writeFileSync('dist/version.json', JSON.stringify({commit:process.env.VCS_REF})+'\n');"

FROM nginx:alpine AS nginx-runtime
ARG VCS_REF=local
LABEL org.opencontainers.image.source="https://github.com/UGR-Lan-Party/ulp-website"
LABEL org.opencontainers.image.revision=$VCS_REF
COPY --from=node-builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/version.json || exit 1
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
