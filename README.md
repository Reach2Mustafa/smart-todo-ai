# 🧠 Smart Todo AI

**Your AI-powered productivity hub for intelligent task management.**

➡️ [**View Live on Vercel**](https://smart-todo-ai-five.vercel.app/)

---

## 🧪 Test User Credentials

Use the following test account to explore the app:

```txt
📧 Email: mohammedb4u2@gmail.com  
🔐 Password: mustafaPass

## ✅ Features

* **Smart Task Creation:** AI-driven suggestions for quicker task entry.
* **Auto-Categorization:** Effortlessly organizes your tasks.
* **Weekly Schedule & Time Blocking:** Visualize and plan your time effectively.
* **Task Prioritization:** Focus on what matters most.
* **User Authentication (JWT):** Secure login and registration.
* **Mobile-Responsive UI:** Access your tasks from any device.

---

## 📸 Screenshots

### 🔐 Auth Screens
**Signup**
![Signup](./screenshots/signup.png)

**Login**
![Login](./screenshots/login.png)

**Forgot Password**
![Forgot Password](./screenshots/forgotpassword.png)

**Email Verification**
![Email Verification](./screenshots/email-verification.png)

**Reset Password**
![Password Reset](./screenshots/password-reset.png)

---

### 🧑‍💼 Profile Screens
**Edit Profile**
![Edit Profile](./screenshots/edit-profile.png)

**Change Password**
![Change Password](./screenshots/charge-password.png)

**User Actions**
![User Actions](./screenshots/user-actions.png)

---

### 📅 Task Management Screens
**Dashboard**
![Dashboard](./screenshots/dashboard.png)

**Dashboard View 2**
![Dashboard 2](./screenshots/dashboard2.png)

**All Tasks**
![Tasks](./screenshots/tasks.png)

**Filter Tasks**
![Filter Tasks](./screenshots/fillter-tasks.png)

**Task Actions**
![Task Actions](./screenshots/task-actions.png)

**Add Task**
![Add Task](./screenshots/add-task.png)

**Add Task with Email or SMS**
![Add Task with Email or Msg](./screenshots/addtask-with-email-or-msg.png)

**Add Task with Summary or Voice**
![Add Task with Summary or Voice](./screenshots/add-task-with-summary-or-speach.png)

**Edit Task**
![Edit Task](./screenshots/edit-task.png)

**Delete Task**
![Delete Task](./screenshots/delete-task.png)

---

## 🧠 AI Capabilities

* **Task Suggestions:** Auto-fills based on input.
* **Smart Reminders & Deadline Detection (WIP):** Future enhancements for proactive task management.

---

## 🛠 Tech Stack

### Backend
* **Python / Django REST Framework**
* **PostgreSQL (via Supabase)**
* **JWT Authentication**

### Frontend
* **Next.js 14 (App Router)**
* **Tailwind CSS**
* **Axios / Context API**

### Deployment
* **Frontend:** Vercel  
* **Backend:** PM2 on Ubuntu VPS with Gunicorn

---

## 🚀 Setup & Development

### Backend


cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Open .env and add your OpenAI API key
# Example:
# OPENAI_API_KEY=your-openai-api-key
python manage.py migrate
python manage.py runserver




### Backend

cd frontend
npm install
## Important:
# Open frontend/apis/variables.js and update the backendUrl constant with your actual backend server URL.
Example:

export const BACKEND_URL = "http://localhost:8000";

npm run dev




