FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        openssh-server sudo iputils-ping ca-certificates haproxy && \
    mkdir /run/sshd && \
    if ! id -u ubuntu >/dev/null 2>&1; then \
        useradd --create-home --uid 1000 --shell /bin/bash ubuntu; \
    fi && \
    echo 'ubuntu:pass123' | chpasswd && \
    usermod -aG sudo ubuntu && \
    sed -ri 's/#?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -ri 's/#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN cat > /etc/haproxy/haproxy.cfg << 'EOF'
global
    maxconn 256
    log stdout format raw local0 info

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s
    option forwardfor
    option http-server-close

frontend http-in
    bind *:80
    default_backend servers
    http-response add-header X-Served-By %[srv_name]

backend servers
    balance roundrobin
    server web01 172.20.0.11:3000 check
    server web02 172.20.0.12:3000 check
EOF

RUN ssh-keygen -A

# Create startup script to run both haproxy and sshd
RUN echo '#!/bin/bash\n\
haproxy -f /etc/haproxy/haproxy.cfg -db &\n\
/usr/sbin/sshd -D' > /startup.sh && \
    chmod +x /startup.sh

CMD ["/startup.sh"] 