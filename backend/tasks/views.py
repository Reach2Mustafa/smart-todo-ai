# tasks/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from collections import defaultdict
from datetime import timedelta
from django.db.models import Count, Q, Case, When, IntegerField
from django.utils.timezone import now
from django.db import transaction
from users.utils import get_user_from_token
from tasks.models import Task
from tasks.serializers import TaskSerializer
from tasks.ai_enhancer import enhance_task_with_ai, extract_tasks_from_summary
from dateutil import parser
import pytz
from django.utils.timezone import is_naive
from django.utils.dateparse import parse_datetime
IST = pytz.timezone("Asia/Kolkata")

def ensure_ist_datetime(iso_datetime_str):
    """
    Convert any datetime string to IST timezone
    Time Complexity: O(1) - constant time parsing and conversion
    """
    if not iso_datetime_str:
        return None
    
    try:
        dt = parser.isoparse(iso_datetime_str)
        if dt.tzinfo is None:
            # Assume UTC if no timezone info
            dt = pytz.utc.localize(dt)
        return dt.astimezone(IST)
    except (ValueError, TypeError):
        return None
@api_view(['POST'])
def ai_create_task(request):
    """
    Time Complexity: O(k) where k is number of tasks to create
    Space Complexity: O(k) for storing created tasks
    """
    user = get_user_from_token(request)
    if not user:
        return Response({"error": "Invalid or missing token"}, status=status.HTTP_401_UNAUTHORIZED)

    task_type = request.data.get("task_type")
    schedule_data = user.weekly_schedule if hasattr(user, 'weekly_schedule') else None

    if task_type == "summary":
        summary = request.data.get("summary")
        if not summary:
            return Response({"error": "Missing summary text"}, status=status.HTTP_400_BAD_REQUEST)

        ai_response = extract_tasks_from_summary(summary, schedule_data)

        if not ai_response.get("success"):
            return Response({
                "error": "AI failed to extract tasks",
                "details": ai_response.get("error", "Unknown error")
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Use bulk_create for better performance - O(k) instead of O(k*log(n))
        tasks_to_create = []
        for task_data in ai_response.get("tasks", []):
            deadline = ensure_ist_datetime(task_data.get("suggested_deadline"))
            task = Task(
                user=user,
                title=task_data["title"],
                description=task_data["description"],
                enhanced_description=task_data["enhanced_description"],
                category=task_data["category"],
                priority=task_data["priority"],
                deadline=deadline
            )
            tasks_to_create.append(task)

        with transaction.atomic():
            created_tasks = Task.objects.bulk_create(tasks_to_create)
            # Refresh from DB to get IDs for serialization
            created_tasks = Task.objects.filter(
                user=user,
                id__in=[task.id for task in created_tasks]
            ).order_by('-created_at')

        return Response({
            "success":True,
            "message": "Tasks created from summary successfully.",
            "tasks": TaskSerializer(created_tasks, many=True).data
        }, status=status.HTTP_201_CREATED)

    elif task_type == "single":
        task_data = request.data.get("task")
        if not task_data:
            return Response({"error": "Missing task data"}, status=400)

        enhanced = enhance_task_with_ai(task_data, schedule_data)
        deadline = ensure_ist_datetime(enhanced.get("suggested_deadline"))

        task = Task.objects.create(
            user=user,
            title=task_data["title"],
            description=task_data["description"],
            enhanced_description=enhanced["enhanced_description"],
            category=enhanced["category"],
            priority=enhanced["priority"],
            deadline=deadline
        )

        return Response({"task":TaskSerializer(task).data, "success":True,}, status=status.HTTP_201_CREATED)

    else:
        return Response({"error": "Invalid task_type. Must be 'single' or 'summary'."}, status=400)

def convert_all_tasks_to_ist():
    """
    Convert all existing task deadlines to IST timezone
    Time Complexity: O(n) where n is number of tasks
    Space Complexity: O(1) - updates in batches
    """
    tasks = Task.objects.exclude(deadline__isnull=True).select_related('user')
    
    batch_size = 1000
    updated_count = 0
    
    for i in range(0, tasks.count(), batch_size):
        batch = tasks[i:i + batch_size]
        tasks_to_update = []
        
        for task in batch:
            if task.deadline:
                # Convert to IST if not already
                if task.deadline.tzinfo != IST:
                    task.deadline = task.deadline.astimezone(IST)
                    tasks_to_update.append(task)
        
        if tasks_to_update:
            Task.objects.bulk_update(tasks_to_update, ['deadline'], batch_size=batch_size)
            updated_count += len(tasks_to_update)
    
    return updated_count


@api_view(['GET'])
def get_user_tasks(request):
    """
    Time Complexity: O(n log n) where n is number of user tasks (due to ordering)
    Space Complexity: O(n) for storing tasks
    """
    user = get_user_from_token(request)
    if not user:
        return Response({"error": "Invalid or missing token"}, status=status.HTTP_401_UNAUTHORIZED)

    # Use select_related if Task has foreign keys to avoid N+1 queries
    tasks = Task.objects.filter(user=user).select_related('user').order_by('-created_at')
    
    # Convert deadlines to IST if needed
    tasks_with_ist = []
    for task in tasks:
        if task.deadline and task.deadline.tzinfo != IST:
            task.deadline = task.deadline.astimezone(IST)
        tasks_with_ist.append(task)
    
    serialized = TaskSerializer(tasks_with_ist, many=True)
    return Response(serialized.data, status=status.HTTP_200_OK)
@api_view(['GET'])
def dashboard_data(request):
    """
    Optimized dashboard data with better time complexity
    Time Complexity: O(n) where n is number of user tasks
    Space Complexity: O(n) for storing and processing tasks
    """
    user = get_user_from_token(request)
    if not user:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    now_time = now().astimezone(IST)
    today_start = now_time.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    this_year = now_time.year

    # Fixed query - removed select_related since we're using only() and don't need user data
    tasks = Task.objects.filter(user=user).only(
        'id', 'title', 'description', 'category', 'priority', 'deadline', 
        'status', 'created_at', 'updated_at'
    ).order_by('deadline')  # Pre-sort for better performance

    # Convert to list for single iteration - O(n)
    tasks_list = list(tasks)
    
    # Convert all deadlines to IST in single pass
    for task in tasks_list:
        if task.deadline and task.deadline.tzinfo != IST:
            task.deadline = task.deadline.astimezone(IST)

    # Single pass aggregation - O(n) instead of multiple O(n) operations
    summary = {"total": 0, "pending": 0, "in_progress": 0, "done": 0, "overdue": 0, "high_priority": 0}
  
    week_tasks = []
    upcoming_deadlines = []
    completed_tasks = []
    completion_times = []
    pending_tasks = []
    created_per_day = defaultdict(int)
    completed_per_day = defaultdict(int)
    category_distribution = defaultdict(int)
    weekly_data = defaultdict(lambda: {"total": 0, "completed": 0})
    updated_days = set()

    for task in tasks_list:
        # Summary stats
        summary["total"] += 1
        if task.status == "pending":
            summary["pending"] += 1
        elif task.status == "in progress":
            summary["in_progress"] += 1
        elif task.status == "completed":
            summary["done"] += 1
        
        if task.deadline and task.deadline < now_time and task.status in ["pending", "in_progress"]:
            summary["overdue"] += 1
        
        if task.priority <= 3:
            summary["high_priority"] += 1

        # Task collections
        if task.deadline:
            if task.deadline.date() >= week_start.date():
                week_tasks.append(task)
            if task.deadline > now_time and task.status in ["pending", "in_progress"]:
                upcoming_deadlines.append(task)
        
        if task.status in ["pending", "in_progress"] and task.deadline:
            pending_tasks.append(task)

        # Completion analysis
        if task.status == "done":
            completed_tasks.append(task)
            completion_time = (task.updated_at - task.created_at).days + ((task.updated_at - task.created_at).seconds / 86400)
            completion_times.append(completion_time)

        # Charts data
        created_per_day[str(task.created_at.date())] += 1
        category_distribution[task.category] += 1
        
        if task.status == "done":
            completed_per_day[str(task.updated_at.date())] += 1

        # Weekly data
        if task.created_at.year == this_year:
            week_label = task.created_at.strftime('%Y-W%W')
            weekly_data[week_label]["total"] += 1
            if task.status == "done":
                weekly_data[week_label]["completed"] += 1

        # Behavior tracking
        if task.updated_at >= week_start:
            updated_days.add(task.updated_at.date())

    # Sort and limit results - O(k log k) where k is much smaller than n
    upcoming_deadlines.sort(key=lambda t: t.deadline)
    upcoming_deadlines = upcoming_deadlines[:5]

    # Find next best task - O(k log k) where k is pending tasks
    next_best_task = None
    if pending_tasks:
        next_best_task = min(pending_tasks, key=lambda t: (t.priority, t.deadline))
        next_best_task = {
            "id": next_best_task.id,
            "title": next_best_task.title,
            "priority": next_best_task.priority,
            "deadline": next_best_task.deadline
        }

    # Calculate averages
    avg_completion_time = f"{round(sum(completion_times)/len(completion_times), 1)} days" if completion_times else None
    
    completion_rate_per_week = [
        {"week": k, "rate": round(v["completed"] / v["total"], 2)}
        for k, v in weekly_data.items() if v["total"] > 0
    ]

    # Calculate streak - O(7) = O(1)
    streak = 0
    for i in range(7):
        day = today_start - timedelta(days=i)
        if any(t.status == "done" and t.updated_at.date() == day.date() for t in tasks_list):
            streak += 1
        else:
            break

    completed_this_week = sum(1 for t in tasks_list if t.status == 'done' and t.updated_at >= week_start)
    avg_tasks_completed_per_day = round(completed_this_week / len(updated_days), 2) if updated_days else 0

    return Response({
        "summary": summary,
       
        "week_tasks": TaskSerializer(week_tasks, many=True).data,
        "upcoming_deadlines": TaskSerializer(upcoming_deadlines, many=True).data,
        "streak": streak,
        "avg_completion_time": avg_completion_time,
        "next_best_task": next_best_task,
        "charts": {
            "created_per_day": dict(created_per_day),
            "completed_per_day": dict(completed_per_day),
            "category_distribution": dict(category_distribution),
            "completion_rate_per_week": completion_rate_per_week
        },
        "behavior": {
            "days_active_this_week": len(updated_days),
            "avg_tasks_completed_per_day": avg_tasks_completed_per_day
        }
    })
@api_view(['PUT', 'PATCH'])
def update_task(request, task_id):
    user=get_user_from_token(request)
    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data

    if 'title' in data:
        task.title = data['title']

    if 'description' in data:
        task.description = data['description']

    if 'enhanced_description' in data:
        task.enhanced_description = data['enhanced_description']

    if 'category' in data:
        task.category = data['category']

    if 'priority' in data:
        try:
            task.priority = int(data['priority'])
        except ValueError:
            return Response({"error": "Invalid priority value."}, status=status.HTTP_400_BAD_REQUEST)

    if 'deadline' in data:
        try:
            task.deadline =ensure_ist_datetime( data['deadline']) # parses ISO 8601 string
        except Exception:
            return Response({"error": "Invalid deadline format."}, status=status.HTTP_400_BAD_REQUEST)

    if 'status' in data:
        if data['status'] in ["pending", "in progress", "completed"]:
            task.status = data['status']
        else:
            return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

    task.save()

    return Response({"message": "Task updated successfully."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def convert_tasks_to_ist1(request):
    """
    Utility endpoint to convert all existing tasks to IST
    Time Complexity: O(n) where n is total number of tasks
    """
   
    
    updated_count = convert_all_tasks_to_ist()
    
    return Response({
        "message": f"Successfully converted {updated_count} tasks to IST timezone",
        "updated_count": updated_count
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_task(request, task_id):
    user=get_user_from_token(request)
    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    task.delete()
    return Response({"message": "Task deleted successfully."}, status=status.HTTP_200_OK)
