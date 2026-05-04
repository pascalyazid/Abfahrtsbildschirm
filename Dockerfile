FROM oven/bun:alpine

WORKDIR /app

COPY server.js index.html ./
COPY css/ ./css/
COPY js/ ./js/

# Default; override at runtime (e.g. via docker compose `env_file` / `environment`)
ENV PORT=3000
EXPOSE ${PORT}

CMD ["bun", "run", "server.js"]
