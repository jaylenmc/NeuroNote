import React, { useState, useEffect } from 'react';
import './Quizzes.css';
import api from '../api/axios';

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [topic, setTopic] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/test/quiz/');
            setQuizzes(response.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const quizData = {
                topic: topic,
                question: question,
                answer: answer
            };
            await api.post('/test/quiz/', quizData);
            // Clear form
            setTopic('');
            setQuestion('');
            setAnswer('');
            setShowCreateForm(false);
            fetchQuizzes();
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    const handleDeleteQuiz = async (id) => {
        try {
            await api.delete(`/test/quiz/${id}`);
            fetchQuizzes();
        } catch (error) {
            console.error('Error deleting quiz:', error);
        }
    };

    return (
        <div className="quizzes-container">
            <div className="quizzes-header">
                <h2>My Quizzes</h2>
                <button 
                    className="create-quiz-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Quiz'}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateQuiz} className="create-quiz-form">
                    <input
                        type="text"
                        placeholder="Topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                    />
                    <button type="submit" className="submit-quiz-btn">Create Quiz</button>
                </form>
            )}

            <div className="quizzes-list">
                {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                        <div key={quiz.id} className="quiz-card">
                            <div className="quiz-header">
                                <h3>{quiz.topic}</h3>
                                <button 
                                    className="delete-quiz-btn"
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="quiz-content">
                                <p className="quiz-question">Q: {quiz.question}</p>
                                <p className="quiz-answer">A: {quiz.answer}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-quizzes">No quizzes created yet</p>
                )}
            </div>
        </div>
    );
};

export default Quizzes; 