import jwt
from datetime import datetime, timedelta
from django.conf import settings
from .models import User
import requests
import os
from rest_framework.exceptions import AuthenticationFailed

def generate_token(user):
    payload = {
        'user_id': str(user.id),  # convert UUID to string here
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    return token


def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise AuthenticationFailed("Authorization header missing")

    try:
        # Expecting header like: "Bearer <token>"
        prefix, token = auth_header.split(' ')
        if prefix.lower() != 'bearer':
            raise AuthenticationFailed("Authorization header must start with Bearer")
    except ValueError:
        raise AuthenticationFailed("Invalid Authorization header format")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed("Invalid token payload")

        user = User.objects.get(id=user_id)
        return user

    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")
    except User.DoesNotExist:
        raise AuthenticationFailed("User not found")


def send_email_via_resend(to_email, subject, html_content):
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL", "support@brandzeals.com")

    url = "https://api.resend.com/emails"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    data = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }

    response = requests.post(url, json=data, headers=headers)
    return response.status_code, response.json()
