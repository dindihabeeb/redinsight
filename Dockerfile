FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and nginx
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        curl openssh-server sudo iputils-ping ca-certificates nginx && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    mkdir /run/sshd && \
    if ! id -u ubuntu >/dev/null 2>&1; then \
        useradd --create-home --uid 1000 --shell /bin/bash ubuntu; \
    fi && \
    echo 'ubuntu:pass123' | chpasswd && \
    usermod -aG sudo ubuntu && \
    sed -ri 's/#?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -ri 's/#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Set proper permissions
RUN chown -R ubuntu:ubuntu /app

# Configure nginx
RUN echo 'server {\n\
    listen 80;\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/sites-available/default

EXPOSE 3000 22 80

RUN ssh-keygen -A

# Create startup script to run nginx, Node.js app and sshd
RUN echo '#!/bin/bash\n\
echo "🌐 Starting nginx..."\n\
service nginx start\n\
echo "🚀 Starting RedInsight application..."\n\
cd /app\n\
su ubuntu -c "npm start" &\n\
echo "🔐 Starting SSH daemon..."\n\
/usr/sbin/sshd -D' > /startup.sh && \
    chmod +x /startup.sh

CMD ["/startup.sh"]