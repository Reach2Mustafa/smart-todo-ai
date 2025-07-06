from django.urls import path
from .views import register_user, login_user, get_user,change_password,reset_password,forgot_password,send_verification_otp,verify_otp,update_user_profile  # Assuming you have a get_user view to fetch user details

urlpatterns = [
    path("register/", register_user),
    path("login/", login_user),
    path("getuser/", get_user),
    path("change-password/", change_password),
    path("reset-password/", reset_password),
    path("forgot-password/", forgot_password),
    path("send-otp/", send_verification_otp),
    path("verify-otp/", verify_otp),
    path("updateuser/", update_user_profile),
]