import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


def default_weekly_schedule():
    """Returns a default weekly schedule ordered from Monday to Sunday with all days unavailable."""
    ordered_days = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ]
    return {
        day: [{"startTime": "Not Available", "endTime": "", "available": False}]
        for day in ordered_days
    }


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None):
        if not email:
            raise ValueError("Email is required")
        if not password:
            raise ValueError("Password is required")
        if not full_name:
            raise ValueError("Full name is required")

        user = self.model(
            email=self.normalize_email(email),
            full_name=full_name,
            weekly_schedule=default_weekly_schedule()  # ✅ Ensure schedule is set by default
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None):
        user = self.create_user(email=email, full_name=full_name, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    OTP_TYPE_CHOICES = (
        ("verification", "Verification"),
        ("reset", "Password Reset"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    token = models.TextField(blank=True, null=True)

    # OTP-related fields
    otp = models.IntegerField(blank=True, null=True)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES, blank=True, null=True)
    resetPasswordToken = models.CharField(max_length=255, blank=True, null=True)
    resetPasswordExpires = models.DateTimeField(blank=True, null=True)

    # Weekly availability schedule
    weekly_schedule = models.JSONField(default=default_weekly_schedule)

    # User status
    verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # Auth config
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def is_otp_expired(self):
        """Check if the OTP is expired."""
        if not self.resetPasswordExpires:
            return True
        return timezone.now() > self.resetPasswordExpires

    def clear_otp(self):
        """Reset OTP-related fields."""
        self.otp = None
        self.otp_type = None
        self.resetPasswordExpires = None
        self.save()
