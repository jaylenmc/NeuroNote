## 🧠 NeuroNote
NeuroNote is a study platform built with Django REST Framework, designed for students. Unlike many tools that focus only on theory, NeuroNote emphasizes practical, applied learning. It uses active recall and spaced repetition to help students master concepts deeply—while adding a touch of competitiveness to make studying more engaging.

## 🚀 Features <br>
-	User Authentication: Google OAuth2 login <br>
-	Study Tools: Notes, File uploads, quizzes(AI gives explanations on correct and inccorect answers), flashcards(spaced repition based on forgetting curve using SM-2/SM-21 algorithms) <br>
-	Pinned Resources: Save and quickly retrieve key files/links in a study room <br>
-	Gamification: Achievements, mastery badges, flashcard/deck mastery, level system <br>

## 🛠️ Planned Features <br>
- 	Collaboration: quiz battles, notes/decks marketplace, group study sessions, leaderboards <br>
- 	Mobile app: Using react native <br>
- 	Automated study plan generator: Generate flashcard schedules, problems sets, quizzes, and breaks to avoid burnout <br>
- 	Analytics/dashboard: show weakness/strong areas, retention forecast, goal tracking <br>
- 	Study mode personalization: Focus mode, application mode, cram mode, deep mastery mode <br>
- 	Curriculum Inegration <br>

## ⚡ Tech Stack <br>
-	Backend: Django, Django REST Framework <br>
-	Database: SQLite (for development) and PostgreSQL (for production) <br>
-	Auth: Google OAuth2 <br>
-	Frontend (planned): React, React Native <br>

## 🛠️ Setup Instructions <br>
1. Clone the repo <br>
- git clone https://github.com/jaylenmc/NeuroNote.git <br>
- cd NeuroNote <br>
    
2. Create & activate a virtual environment <br>
- python3 -m venv venv <br>
- source venv/bin/activate (Mac/Linux) <br>
- venv\Scripts\activate (Windows) <br>
    
3. Install dependencies <br>
- pip install -r requirements.txt <br>
    
4. Run migrations <br>
⚠️ Note: Migrations were reset to simplify setup. <br>
Just generate them fresh: <br>
- python manage.py makemigrations <br>
- python manage.py migrate <br>
    
5. Create a superuser <br>
- python manage.py createsuperuser <br>

(Optional) Run The In Progress Frontend: <br>
(Basic UI runs, but not all features are complete) <br>
- cd react-project <br>
- cd frontend <br>
- npm install <br>
  
6. Run the server <br>
  - Backend: python3 manage.py runserver -> visit: http://127.0.0.1:8000/ <br>
  - Frontend: npm run dev -> visit: http://localhost:5173/ <br>

## 📝 Notes for Reviewers / Employers <br>
  -	Migrations were reset for simplicity, so you won’t encounter historical conflicts when setting up locally. <br>
  -	Codebase demonstrates: <br>
  -	Includes implementation of spaced repetition scheduling (SM-2/SM-21 algorithms) <br>
  -	Clean API design with DRF <br>
  -	Custom serializers & services (e.g. scheduling algorithm <br>
  -	Authentication flow with external providers <br>
  -	Unit tests for critical paths <br>
