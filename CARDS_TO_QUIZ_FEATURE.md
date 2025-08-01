# Cards to Quiz Feature

## Overview
The Cards to Quiz feature allows users to convert their reviewed flashcards into a written quiz that is automatically graded by AI with detailed explanations.

## How It Works

### 1. Review Session Completion
- After completing a flashcard review session, users see a "Take Quiz" button
- This button appears alongside the "Back to Study Room" button on the session complete screen

### 2. Quiz Creation
- When "Take Quiz" is clicked, the system:
  - Takes all reviewed cards from the session
  - Creates a written quiz with questions from the card fronts
  - Sets the correct answers from the card backs
  - Stores this as a temporary quiz in the database

### 3. Quiz Taking Experience
- Users are presented with one question at a time
- Each question requires a written answer
- Navigation buttons allow moving between questions
- Progress bar shows completion status
- Timer tracks time spent on the quiz

### 4. AI Grading
- When the quiz is submitted, answers are sent to Claude AI
- AI compares user answers with correct answers
- Provides detailed explanations for each answer
- Returns scores (Correct/Incorrect) with reasoning

### 5. Results Display
- Shows all questions with:
  - Original question text
  - User's answer
  - Correct answer
  - AI explanation
  - Score (Correct/Incorrect)
- Displays quiz statistics (time taken, number of questions)

## Technical Implementation

### Frontend Components
- `CardsToQuiz.jsx` - Main quiz component
- `CardsToQuiz.css` - Styling for the quiz interface
- Updated `ReviewSession.jsx` - Added quiz option to session complete

### Backend API
- `CardsToQuizView` in `tests/views.py`
- Uses `cards_to_quiz()` function from `claude_client/client.py`
- Creates temporary quiz with `is_cards_to_quiz=True` flag

### API Endpoints
- `POST /api/test/cards-to-quiz/` - Create quiz from cards
- `GET /api/test/cards-to-quiz/` - Fetch created quiz
- `POST /api/test/cards-to-quiz/` with `reviewed: true` - Submit for AI grading

### Data Flow
1. Review session → Collect reviewed cards
2. Create quiz → Send card data to backend
3. Take quiz → Display questions one by one
4. Submit answers → Send to AI for grading
5. Display results → Show graded answers with explanations

## User Experience

### Session Complete Screen
```
┌─────────────────────────────────┐
│         Session Complete!       │
│                                 │
│ Cards Reviewed: 10              │
│ Time Spent: 5:30                │
│                                 │
│ [Back to Study Room] [Take Quiz]│
└─────────────────────────────────┘
```

### Quiz Interface
```
┌─────────────────────────────────┐
│ [← Back] Progress: 3/10 [5:30] │
│                                 │
│ Question 3                      │
│ What is the capital of France?  │
│                                 │
│ Your Answer:                    │
│ [Textarea for answer]           │
│                                 │
│ [Previous] [Next Question]      │
└─────────────────────────────────┘
```

### Results Display
```
┌─────────────────────────────────┐
│         Quiz Results            │
│                                 │
│ Question 1                      │
│ What is photosynthesis?         │
│                                 │
│ Correct Answer: Process of...   │
│ Your Answer: Plants make food   │
│ AI Explanation: Your answer...  │
│ Score: [CORRECT]                │
└─────────────────────────────────┘
```

## Features

### ✅ Implemented
- Automatic quiz creation from reviewed cards
- Written answer interface
- Progress tracking and navigation
- Timer functionality
- AI-powered grading with explanations
- Modern dark theme UI
- Responsive design
- Error handling

### 🎨 UI/UX Features
- Glassmorphism design elements
- Smooth animations and transitions
- Color-coded score indicators
- Progress bars and timers
- Mobile-responsive layout
- Consistent with app theme

## Future Enhancements
- Quiz retry functionality
- Performance analytics
- Export quiz results
- Custom quiz settings
- Multiple choice option
- Time limits per question 