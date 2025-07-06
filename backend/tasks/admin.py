from django.contrib import admin
from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'priority', 'status', 'deadline', 'created_at',"enhanced_description")
    list_filter = ('status', 'priority', 'category', 'created_at', 'deadline')
    search_fields = ('title', 'description', 'user__email', 'category')
    ordering = ('-created_at',)
    autocomplete_fields = ['user']
    date_hierarchy = 'deadline'
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(Task, TaskAdmin)
