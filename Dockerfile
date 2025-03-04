FROM nginx:1

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY scripts.js /usr/share/nginx/html/scripts.js
COPY index.html /usr/share/nginx/html/index.html
COPY guardian.png /usr/share/nginx/html/guardian.png
COPY oracle.png /usr/share/nginx/html/oracle.png
COPY favicon.ico /usr/share/nginx/html/favicon.ico
COPY default.conf /etc/nginx/conf.d/default.conf

# script to inject variables in the nginx index.html file
COPY ./40-inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh
RUN chmod +r /usr/share/nginx/html/*png
