🧠 NeuroNote
A study platform built with Django REST Framework and designed for students. Unlike many study tools that focus mostly on theory, NeuroNote is built to emphasize practical, applied 
learning. The goal is to help students, especially in engineering and technical majors to learn more effectively through active recall and spaced repetition rather than passive review 
in order to gain a deeper understanding. Meant to bring a tad bit of competitiveness amoung friends to make study sessions a little more enjoyable.

🚀 Features 
	-	User Authentication (Google OAuth2 login)
	-	Notes, quizzes(AI gives explanations on correct and inccorect answers), flashcards(spaced repition based on forgetting curve using SM-2/SM-21 algorithms), File uploads, (Able to pin resources in study room for easy retriveval)
	-	Achievements, mastery badges, flashcard/deck mastery
	-	Level system

🛠️ Planned Features
 	- 	Collaboration (quiz battles, notes/decks marketplace, group study sessions, leaderboards)
  	- 	Mobile app
   	- 	Automated study plan generator (generate flashcard schedules, problems sets, quizzes, and breaks to avoid burnout)
	- 	Analytics/dashboard (weakness/strong areas, retention forecast, goal tracking)
 	- 	Study mode personalization (Focus mode, application mode, cram mode, deep mastery mode)
  	- 	Curriculum Inegration

 ⚡ Tech Stack
	-	Backend: Django, Django REST Framework
	-	Database: SQLite (dev), easily switchable to PostgreSQL
	-	Auth: Google OAuth2
	-	Frontend (planned): React, React Native

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

📝 Notes for Reviewers / Employers
  -	Migrations were reset for simplicity, so you won’t encounter historical conflicts when setting up locally.
  -	Codebase demonstrates:
  -	Clean API design with DRF
  -	Custom serializers & services (e.g. scheduling algorithm)
  -	Authentication flow with external providers
  -	Unit tests for critical paths
