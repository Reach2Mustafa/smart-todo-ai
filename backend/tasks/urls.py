from django.urls import path
from .views import (
    ai_create_task,
    get_user_tasks,
    dashboard_data,
    delete_task,
    update_task  # Make sure you've implemented this
)

urlpatterns = [
    path("create_task/", ai_create_task),
    path("get_user_tasks/", get_user_tasks),
    path("dashboard_data/", dashboard_data),
    path("delete/<int:task_id>/", delete_task),      # DELETE task by ID
    path("update/<int:task_id>/", update_task),      # PUT/PATCH to update task
]
