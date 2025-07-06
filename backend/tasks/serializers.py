from rest_framework import serializers
from tasks.models import Task

from django.utils import timezone
import pytz

# Define IST timezone
IST = pytz.timezone('Asia/Kolkata')

class ISTDateTimeField(serializers.DateTimeField):
    """Custom DateTimeField that always returns datetime in IST"""
    
    def to_representation(self, value):
        if value is None:
            return None
        
        # Convert to IST if not already
        if value.tzinfo is None:
            value = timezone.make_aware(value, timezone.utc)
        
        ist_datetime = value.astimezone(IST)
        return ist_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')

class TaskSerializer(serializers.ModelSerializer):
    deadline = ISTDateTimeField(read_only=True)
    created_at = ISTDateTimeField(read_only=True)
    updated_at = ISTDateTimeField(read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'