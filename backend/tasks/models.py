from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

    title = models.CharField(max_length=255)
    description =  models.TextField(default="", blank=True)
    enhanced_description = models.TextField(default="", blank=True)

    category = models.CharField(max_length=100)

    priority = models.PositiveIntegerField(default=5)  # 1 (high) to 10 (low)
    deadline = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("in progress", "In Progress"),
            ("completed", "Completed")
        ],
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"
