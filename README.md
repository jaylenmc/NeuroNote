🧠 NeuroNote
NeuroNote is a study platform built with Django REST Framework, designed for students. Unlike many tools that focus only on theory, NeuroNote emphasizes practical, applied learning. It uses active recall and spaced repetition to help students master concepts deeply—while adding a touch of competitiveness to make studying more engaging.

🚀 Features <br>
	-	User Authentication: Google OAuth2 login <br>
	-	Study Tools: Notes, File uploads, quizzes(AI gives explanations on correct and inccorect answers), flashcards(spaced repition based on forgetting curve using SM-2/SM-21 algorithms) <br>
 	-	Pinned Resources: Save and quickly retrieve key files/links in a study room <br>
	-	Gamification: Achievements, mastery badges, flashcard/deck mastery, level system <br>

🛠️ Planned Features
 	- 	Collaboration: quiz battles, notes/decks marketplace, group study sessions, leaderboards
  	- 	Mobile app: Using react native
   	- 	Automated study plan generator: Generate flashcard schedules, problems sets, quizzes, and breaks to avoid burnout
	- 	Analytics/dashboard: show weakness/strong areas, retention forecast, goal tracking
 	- 	Study mode personalization: Focus mode, application mode, cram mode, deep mastery mode
  	- 	Curriculum Inegration

 ⚡ Tech Stack
	-	Backend: Django, Django REST Framework
	-	Database: SQLite (for development) and PostgreSQL (for production)
	-	Auth: Google OAuth2
	-	Frontend (planned): React, React Native

🛠️ Setup Instructions
1. Clone the repo
  - git clone https://github.com/jaylenmc/NeuroNote.git
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

(Optional) Run The In Progress Frontend:
(Basic UI runs, but not all features are complete)
* After Cloning Repo *
- cd react-project
- cd frontend
- npm install
  
6. Run the server
  - Backend: python3 manage.py runserver -> visit: http://127.0.0.1:8000/
  - Frontend: npm run dev -> visit: http://localhost:5173/

📝 Notes for Reviewers / Employers
  -	Migrations were reset for simplicity, so you won’t encounter historical conflicts when setting up locally.
  -	Codebase demonstrates:
  -	Includes implementation of spaced repetition scheduling (SM-2/SM-21 algorithms)
  -	Clean API design with DRF
  -	Custom serializers & services (e.g. scheduling algorithm)
  -	Authentication flow with external providers
  -	Unit tests for critical paths
