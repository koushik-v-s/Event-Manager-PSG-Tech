FROM node:20-slim

# Set up Debian repository and install dependencies
RUN rm -f /etc/apt/sources.list.d/debian.sources && \
    echo "deb http://ftp.us.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.us.debian.org/debian bookworm-updates main" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      gnupg && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      chromium \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libgbm1 \
      libasound2 \
      fonts-liberation \
      libnspr4 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y curl
RUN npm install
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
