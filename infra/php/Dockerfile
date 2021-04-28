FROM php:7.4-fpm-buster
SHELL ["/bin/bash", "-oeux", "pipefail", "-c"]

# timezone environment
ENV TZ=UTC \
  # locale
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US:en \
  LC_ALL=en_US.UTF-8 \
  # composer environment
  COMPOSER_ALLOW_SUPERUSER=1 \
  COMPOSER_HOME=/composer \
  # Laravel environment
  DB_CONNECTION=mysql \
  DB_HOST=db \
  DB_DATABASE=laravel_local \
  DB_USERNAME=phper \
  DB_PASSWORD=secret \
  REDIS_HOST=redis 


COPY --from=composer:2.0 /usr/bin/composer /usr/bin/composer

RUN apt update && \
  apt -y install \
  libicu-dev \
  libonig-dev \
  libzip-dev \
  unzip \
  locales \
  zlib1g-dev \
  libpng-dev \
  libjpeg62-turbo-dev \
  libfreetype6-dev &&\
  apt clean && \
  rm -rf /var/lib/apt/lists/* && \
  locale-gen en_US.UTF-8 && \
  localedef -f UTF-8 -i en_US en_US.UTF-8 && \
  mkdir /var/run/php-fpm && \
  mkdir /var/log/php && \
  pecl install -o -f redis &&\
  docker-php-ext-configure gd \
  --enable-gd \
  --with-freetype \ 
  --with-jpeg && \
  docker-php-ext-install \
  -j$(nproc) gd \
  intl \
  pdo_mysql \
  zip \
  bcmath && \
  docker-php-ext-enable redis && \
  composer config -g process-timeout 3600 && \
  composer config -g repos.packagist composer https://packagist.org

COPY ./php-fpm.d/zzz-www.conf /usr/local/etc/php-fpm.d/zzz-www.conf
COPY ./php.ini /usr/local/etc/php/php.ini

WORKDIR /work/laravel