FROM nginx:1

COPY index.html /usr/share/nginx/html/index.html
COPY guardian.png /usr/share/nginx/html/guardian.png
COPY operator.png /usr/share/nginx/html/operator.png
COPY default.conf /etc/nginx/conf.d/default.conf

# script to inject variables in the nginx index.html file
COPY ./40-inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh
