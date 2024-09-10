"""
Django settings for restaurantManagement project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-r9$8yk+n(cvj=vdu&#c_(@265=)p-0&e_tb98cef@w30dt7ecw'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'restaurant.apps.RestaurantConfig',
    'rest_framework',
    'oauth2_provider',
    'cloudinary',
    'drf_yasg',
    'djf_surveys'
]

import cloudinary.uploader


# Configuration
cloudinary.config(
    cloud_name = "dvxmxdhbj",
    api_key = "559284823772255",
    api_secret = "AmuVLvn83xA4HHHqTasCT8OMeCM", # Click 'View API Keys' above to copy your API secret
    secure=True
)


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

import pymysql
pymysql.install_as_MySQLdb()

ROOT_URLCONF = 'restaurantManagement.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'restaurantManagement.wsgi.application'
AUTH_USER_MODEL = 'restaurant.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ),
}

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'qlqadb',
        "USER" : 'root',
        'PASSWORD' : 'Admin@123',
        'HOST' : ''
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

## Bình
# CLIENT_ID = 'X0krpG85JYNi3nnLzunU7699TRChJqhoU5phvqQ6'
# CLIENT_SECRET = '1uh5kSJIkjLZLu2gGhfzT6YhaFCfkAAT7yzHUiK90ayJC6DZeuGIYCTR5ejSkdtxXbOFM5ie2kGaD7nhfqfjj7ITsURXC1rZvehSFL58U7IDbhqsTVzKDDYyktEooRsP'

## Tài
CLIENT_ID = 'e0KH7qtWHY4WtxmtJ8sSmaBlUoY2MPMoJ7wLG0CX'
CLIENT_SECRET = 'nf365P88cqx2wRszz2jMVQVkQJk1R2FA2m7X3pPZstB18S66ufZw91u8qcOx5VJJoNEvIcQj98pPATd6GsmnxtaOOpGFznfthI0pLX9v6KKj39OWcEo8y8y7CB5VdhVB'