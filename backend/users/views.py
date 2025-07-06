import random
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from django.contrib.auth.hashers import check_password
from .utils import generate_token ,get_user_from_token ,send_email_via_resend # or wherever you put the function
from django.utils.crypto import get_random_string
from .models import User
from datetime import timedelta

@api_view(['POST'])
def register_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('name')

    if not full_name or not email or not password:
        return Response(
            {"error": "Name, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(email=email, full_name=full_name, password=password)
        token = generate_token(user)
        user.token = token
        user.save()

        # Return safe fields only
        user_data = {
           "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "token": user.token,
            "verified": user.verified,
            "weekly_schedule": user.weekly_schedule,
       
        }

        return Response({
            "message": "User created successfully",
            "user": user_data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    try:
        data = request.data
        email = data.get("email")
        password = data.get("password")

        user = User.objects.get(email=email)

        if not check_password(password, user.password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        token = generate_token(user)
        user.token = token
        user.save()

        user_data = {
           "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "token": user.token,
            "verified": user.verified,
            "weekly_schedule": user.weekly_schedule,
          
        }

        return Response(user_data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def change_password(request):
    user = get_user_from_token(request)
    if not user:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "Old and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    if old_password == new_password:
        return Response({"error": "New password cannot be the same as old password."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_user(request):
    try:
        user = get_user_from_token(request)
     
        return Response({
             "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "token": user.token,
            "verified": user.verified,
            "weekly_schedule": user.weekly_schedule,
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def reset_password(request):
    token = request.data.get("token")
    email = request.data.get("email")
    new_password = request.data.get("newPassword")

    if not token or not email or not new_password:
        return Response(
            {"error": "Token, email, and new password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 6:
        return Response(
            {"error": "New password must be at least 6 characters long."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.filter(
            email=email,
            resetPasswordToken=token,
            resetPasswordExpires__gte=timezone.now()
        ).first()

        if not user:
            return Response(
                {"error": "Password reset token is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password and clear token
        user.set_password(new_password)
        user.resetPasswordToken = None
        user.resetPasswordExpires = None
        user.save()

        return Response(
            {"message": "Your password has been successfully reset."},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print("Error resetting password:", str(e))
        return Response(
            {"error": "Internal server error."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )  

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "message": "If the email is registered, a reset link has been sent."
        }, status=200)

    token = get_random_string(64)
    user.resetPasswordToken = token
    user.resetPasswordExpires = timezone.now() + timedelta(hours=1)
    user.save()

    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}&email={email}"

    html = f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link will expire in 1 hour:</p>
    <a href="{reset_link}">{reset_link}</a>
    """

    status_code, result = send_email_via_resend(email, "Password Reset", html)

    if status_code != 200:
        return Response({"error": "Failed to send email."}, status=400)

    return Response({"message": "Password reset email sent."})

@api_view(['POST'])
def send_verification_otp(request):
    email = request.data.get("email")
    
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Generate OTP and expiry
    otp = random.randint(100000, 999999)
    expires_at = timezone.now() + timezone.timedelta(minutes=10)

    user.otp = otp
    user.resetPasswordExpires = expires_at
    user.save()

    # Email content
    reset_html = f"""
        <p>Hello {user.full_name},</p>
        <p>Your verification OTP is: <strong>{otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
    """

    # Send email
    response_status, response_json = send_email_via_resend(
        to_email=email,
        subject="Email Verification OTP",
        html_content=reset_html,
    )

    if response_status >= 400:
        return Response({"error": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_otp(request):
    user = get_user_from_token(request)
    if not user:
        return Response({"error": "Invalid user token."}, status=status.HTTP_401_UNAUTHORIZED)

    otp = request.data.get("otp")

    if not otp:
        return Response({"error": "OTP is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.otp or user.otp != otp:
        return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.resetPasswordExpires or timezone.now() > user.resetPasswordExpires:
        return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

    user.verified = True
    user.otp = None
    user.resetPasswordExpires = None
    user.save()

    return Response({"message": "OTP verified. User is now verified."}, status=status.HTTP_200_OK)

@api_view(["PUT"])

def update_user_profile(request):
    user = get_user_from_token(request)
    data = request.data

    updated = False

    # Update name if provided
    new_name = data.get("full_name")
    if new_name:
        user.full_name = new_name
        updated = True

    # Update schedule if provided
    new_schedule = data.get("weekly_schedule")
    if new_schedule:
        user.weekly_schedule = new_schedule
        updated = True

    if updated:
        user.save()
        return Response({
            "message": "User profile updated successfully.",
            "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "token": user.token,
            "verified": user.verified,
            "weekly_schedule": user.weekly_schedule,
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No data provided to update."}, status=status.HTTP_400_BAD_REQUEST)