#!/usr/bin/env bash
# Bootstrap Let's Encrypt certificates for the proxy.
# Run from the repo root: ./proxy/init-letsencrypt.sh
#
# Reads DOMAIN and CERTBOT_EMAIL from .env (or environment).
# Pass --staging to test against Let's Encrypt's staging server first
# so you don't burn through the production rate limit.

set -euo pipefail

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

: "${DOMAIN:?Set DOMAIN in .env or environment}"
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env or environment}"

staging=0
if [ "${1:-}" = "--staging" ]; then staging=1; fi

data_path="./certbot"
rsa_key_size=4096

if [ -d "$data_path/conf/live/$DOMAIN" ]; then
  read -rp "Existing certs for $DOMAIN found. Replace? (y/N) " ans
  case "$ans" in [yY]*) ;; *) exit 0 ;; esac
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters …"
  mkdir -p "$data_path/conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    > "$data_path/conf/options-ssl-nginx.conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    > "$data_path/conf/ssl-dhparams.pem"
fi

echo "### Creating dummy certificate for $DOMAIN …"
path="/etc/letsencrypt/live/$DOMAIN"
mkdir -p "$data_path/conf/live/$DOMAIN"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout '$path/privkey.pem' \
    -out    '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Starting proxy …"
docker compose up -d proxy

echo "### Removing dummy certificate …"
docker compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$DOMAIN \
  /etc/letsencrypt/archive/$DOMAIN \
  /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "### Requesting Let's Encrypt certificate for $DOMAIN …"
staging_arg=""
[ "$staging" = "1" ] && staging_arg="--staging"

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $CERTBOT_EMAIL \
    -d $DOMAIN \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --non-interactive \
    --force-renewal" certbot

echo "### Reloading nginx …"
docker compose exec proxy nginx -s reload

echo "### Done. Visit https://$DOMAIN"
