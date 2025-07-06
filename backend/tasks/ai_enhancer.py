from openai import OpenAI
import pytz
import json
from datetime import datetime, timedelta

from config import settings

IST = pytz.timezone("Asia/Kolkata")

WEEKDAY_INDEX = {
    "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
    "Friday": 4, "Saturday": 5, "Sunday": 6
}

def get_datetime_this_week(day_name, time_str):
    now = datetime.now(IST)
    target_weekday = WEEKDAY_INDEX[day_name]
    days_ahead = (target_weekday - now.weekday()) % 7
    target_date = now + timedelta(days=days_ahead)
    time_obj = datetime.strptime(time_str, "%I:%M %p").time()
    return IST.localize(datetime.combine(target_date.date(), time_obj))

def convert_schedule_to_time_blocks(schedule):
    time_blocks = []
    for day, slots in schedule.items():
        for slot in slots:
            if slot.get("available"):
                start = get_datetime_this_week(day, slot["startTime"])
                end = get_datetime_this_week(day, slot["endTime"])
                time_blocks.append({
                    "day": day,
                    "start": start.isoformat(),
                    "end": end.isoformat()
                })
    return time_blocks

def enhance_task_with_ai(task_details, weekly_schedule=None):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    # Get current IST time
    current_ist = datetime.now(IST)
    current_ist_str = current_ist.strftime("%Y-%m-%d %H:%M:%S %Z")

    # Convert time blocks if schedule is available
    time_blocks = convert_schedule_to_time_blocks(weekly_schedule) if weekly_schedule else []

    if time_blocks:
        availability_section = f"""
The user is available at:
{json.dumps(time_blocks, indent=2)}
"""
    else:
        availability_section = """
The user's availability schedule is not provided.
Please assume a normal 9am–5pm workday when assigning deadlines.
"""

    prompt = f"""
The user wants to create a task:
- Title: {task_details.get("title")}
- Description: {task_details.get("description")}

Current IST time: {current_ist_str}

{availability_section}

IMPORTANT INSTRUCTIONS:
1. Always work in IST timezone (Asia/Kolkata)
2. The suggested_deadline MUST be in the future - never set a deadline that has already passed
3. Consider the current IST time when calculating deadlines
4. Return the suggested_deadline in ISO 8601 format with IST timezone
5. Make sure the deadline is realistic and achievable

Return a JSON with:
- priority (1–10)
- category (Work, Health, Personal, Meeting, etc)
- enhanced_description
- suggested_deadline (ISO 8601 in IST timezone, must be future date/time)
"""

    schema = {
        "name": "enhance_task",
        "description": "Enhance task with deadline and priority",
        "parameters": {
            "type": "object",
            "properties": {
                "priority": {"type": "integer"},
                "suggested_deadline": {"type": "string"},
                "category": {"type": "string"},
                "enhanced_description": {"type": "string"}
            },
            "required": ["priority", "suggested_deadline", "category", "enhanced_description"]
        }
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini-2025-04-14",
            messages=[
                {"role": "system", "content": "You are a smart task planner. Always work in IST timezone and never set deadlines in the past."},
                {"role": "user", "content": prompt}
            ],
            tools=[{"type": "function", "function": schema}],
            tool_choice={"type": "function", "function": {"name": "enhance_task"}}
        )

        # Tool call parsing in new SDK
        args_str = response.choices[0].message.tool_calls[0].function.arguments
        result = json.loads(args_str)
        
        # Validate that deadline is in the future
        if result.get("suggested_deadline"):
            try:
                deadline_dt = datetime.fromisoformat(result["suggested_deadline"].replace("Z", "+00:00"))
                if deadline_dt.tzinfo is None:
                    deadline_dt = IST.localize(deadline_dt)
                elif deadline_dt.tzinfo != IST:
                    deadline_dt = deadline_dt.astimezone(IST)
                
                if deadline_dt <= current_ist:
                    # If deadline is in the past, set it to tomorrow at 9 AM
                    tomorrow_9am = (current_ist + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                    result["suggested_deadline"] = tomorrow_9am.isoformat()
            except:
                # If parsing fails, set default future deadline
                tomorrow_9am = (current_ist + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                result["suggested_deadline"] = tomorrow_9am.isoformat()
        
        return result

    except Exception as e:
        print(f"[ERROR] AI enhancement failed: {e}")
        # Return default future deadline
        tomorrow_9am = (current_ist + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        return {
            "priority": 5,
            "suggested_deadline": tomorrow_9am.isoformat(),
            "category": "General",
            "enhanced_description": task_details.get("description", "")
        }


def extract_tasks_from_summary(summary_text, weekly_schedule=None):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    # Get current IST time
    current_ist = datetime.now(IST)
    current_ist_str = current_ist.strftime("%Y-%m-%d %H:%M:%S %Z")

    time_blocks = convert_schedule_to_time_blocks(weekly_schedule) if weekly_schedule else []

    availability_section = (
        f"The user is available at:\n{json.dumps(time_blocks, indent=2)}"
        if time_blocks else
        "The user's availability is not provided. Assume a normal 9am–5pm workday when assigning deadlines."
    )

    prompt = f"""
You are a smart assistant. Analyze the following summary and extract all actionable tasks.

Summary:
\"\"\"
{summary_text}
\"\"\"

Current IST time: {current_ist_str}

{availability_section}

IMPORTANT INSTRUCTIONS:
1. Always work in IST timezone (Asia/Kolkata)
2. ALL suggested_deadline values MUST be in the future - never set deadlines that have already passed
3. Consider the current IST time when calculating all deadlines
4. Return all suggested_deadline values in ISO 8601 format with IST timezone
5. Make sure all deadlines are realistic and achievable
6. If a task mentions a specific time that has already passed, adjust it to the next appropriate future time

Return a JSON array of tasks, where each task contains:
- title
- description
- enhanced_description
- priority (1–10)
- category (Work, Health, Personal, Meeting, etc.)
- suggested_deadline (ISO 8601 format, IST timezone, MUST be future date/time)
"""

    schema = {
        "name": "extract_tasks",
        "description": "Extract and enhance all tasks from a given summary.",
        "parameters": {
            "type": "object",
            "properties": {
                "tasks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "enhanced_description": {"type": "string"},
                            "priority": {"type": "integer"},
                            "category": {"type": "string"},
                            "suggested_deadline": {"type": "string"},
                        },
                        "required": [
                            "title",
                            "description",
                            "enhanced_description",
                            "priority",
                            "category",
                            "suggested_deadline"
                        ]
                    }
                }
            },
            "required": ["tasks"]
        }
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini-2025-04-14",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts and enriches tasks from summaries. Always work in IST timezone and never set deadlines in the past."},
                {"role": "user", "content": prompt}
            ],
            tools=[{"type": "function", "function": schema}],
            tool_choice={"type": "function", "function": {"name": "extract_tasks"}}
        )

        args_str = response.choices[0].message.tool_calls[0].function.arguments
        data = json.loads(args_str)

        # Validate that all deadlines are in the future
        tasks = data.get("tasks", [])
        for task in tasks:
            if task.get("suggested_deadline"):
                try:
                    deadline_dt = datetime.fromisoformat(task["suggested_deadline"].replace("Z", "+00:00"))
                    if deadline_dt.tzinfo is None:
                        deadline_dt = IST.localize(deadline_dt)
                    elif deadline_dt.tzinfo != IST:
                        deadline_dt = deadline_dt.astimezone(IST)
                    
                    if deadline_dt <= current_ist:
                        # If deadline is in the past, set it to tomorrow at 9 AM
                        tomorrow_9am = (current_ist + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                        task["suggested_deadline"] = tomorrow_9am.isoformat()
                except:
                    # If parsing fails, set default future deadline
                    tomorrow_9am = (current_ist + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                    task["suggested_deadline"] = tomorrow_9am.isoformat()

        return {
            "success": True,
            "message": "Tasks extracted successfully.",
            "tasks": tasks
        }

    except Exception as e:
        print(f"[ERROR] Task extraction failed: {e}")
        return {
            "success": False,
            "message": "AI failed to extract tasks.",
            "error": str(e),
            "tasks": []
        }