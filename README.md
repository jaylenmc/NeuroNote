🧠 NeuroNote
A study platform built with Django REST Framework and designed for engineering students. It supports notes, file uploads, spaced repetition scheduling, and Google OAuth2 login.

🚀 Features
	•	User Authentication (Google OAuth2 login)
	•	Notes & Documents (create, edit, delete, organize)
	•	File Uploads (store & pin files to study rooms)
	•	Spaced Repetition Scheduling (SM-2/SM-21 algorithms for flashcards)
	•	API-first Backend (designed for a React Native frontend)
	•	Test Coverage (unit tests for models, serializers, and views)

 ⚡ Tech Stack
	•	Backend: Django, Django REST Framework
	•	Database: SQLite (dev), easily switchable to PostgreSQL
	•	Auth: Google OAuth2
	•	Frontend (planned): React Native

🛠️ Setup Instructions

1. Clone the repo
  - git clone https://github.com/your-username/NeuroNote.git
  - cd NeuroNote
    
2. Create & activate a virtual environment
  - python3 -m venv venv
  - source venv/bin/activate   # Mac/Linux
  - venv\Scripts\activate      # Windows
    
3. Install dependencies
  - pip install -r requirements.txt
    
4. Run migrations
⚠️ Note: Migrations were reset to simplify setup.
Just generate them fresh:
  - python manage.py makemigrations
  - python manage.py migrate
    
5. Create a superuser
- python manage.py createsuperuser
  
6. Run the server
  - python manage.py runserver
  - Now visit: http://127.0.0.1:8000/

📌 API Endpoints
  •	POST /auth/google/ – Login with Google OAuth2
  •	GET /api/notes/ – List notes
  •	POST /api/files/ – Upload a file
  •	POST /api/pinned/ – Pin a resource to a study room
  •	GET /api/schedule/ – Get next review items (SM-21 algorithm)

📝 Notes for Reviewers / Employers
  •	Migrations were reset for simplicity, so you won’t encounter historical conflicts when setting up locally.
  •	Codebase demonstrates:
  •	Clean API design with DRF
  •	Custom serializers & services (e.g. scheduling algorithm)
  •	Authentication flow with external providers
  •	Unit tests for critical paths
