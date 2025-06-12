import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiHome, FiSettings, FiLogOut, FiFolder, FiPlus, FiBook, FiLayers, FiCheckSquare, FiTrendingUp, FiAward, FiShare2, FiStar, FiMoreVertical, FiUsers, FiFileText, FiEdit2, FiArrowLeft, FiChevronRight, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import closedFolderIcon from '../assets/ClosedFolder.svg';
import openFolderIcon from '../assets/OpenFolder.svg';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import blackboardBg from '../assets/Blackboard.png';
import './Dashboard.css';
import './FlashcardsNightOwl.css';
import QuizView from './QuizView';
import ReviewCards from './ReviewCards';
import Calendar from './Calendar';
import ReviewCardsDashboard from './ReviewCardsDashboard';
import DocumentEditor from './DocumentEditor';
import bookshelfImg from '../assets/bookshelf.jpg';
import { useNavigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import './DashboardHome.css';

function Dashboard() {
    const navigate = useNavigate(); // <-- Move here, top level
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [folders, setFolders] = useState([]);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTab, setSelectedTab] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, type: null, id: null });
    const [showNewDeckModal, setShowNewDeckModal] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckSubject, setNewDeckSubject] = useState('');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [showNewCardModal, setShowNewCardModal] = useState(false);
    const [newCard, setNewCard] = useState({
        question: '',
        answer: '',
        scheduled_date: ''
    });
    // Add navigation history state
    const [navHistory, setNavHistory] = useState([{ view: 'dashboard', folder: null, deck: null }]);
    const [currentNavIndex, setCurrentNavIndex] = useState(0);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [isLoading, setIsLoading] = useState({
        initialLoad: true,
        folders: false,
        decks: false,
        cards: false,
        delete: false
    });

    // Add transition states
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionTimeout, setTransitionTimeout] = useState(null);

    // Mock data for progress tracking
    const [reviewProgress] = useState({
        last7Days: {
            correct: 45,
            incorrect: 15,
            total: 60,
            accuracy: 75
        },
        needsReview: [
            { topic: 'Biology', count: 8 },
            { topic: 'Chemistry', count: 5 },
            { topic: 'Physics', count: 3 }
        ]
    });

    const [quizProgress] = useState({
        topics: [
            { name: 'Biology', score: 75, needsWork: true },
            { name: 'Chemistry', score: 90, needsWork: false },
            { name: 'Physics', score: 65, needsWork: true }
        ]
    });

    const [showNewQuizModal, setShowNewQuizModal] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        topic: '',
        subject: ''
    });
    const [quizzes, setQuizzes] = useState([]);
    const [showQuizView, setShowQuizView] = useState(false);
    const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question_input: '',
        question_type: 'MC',
        answers: [
            { answer_input: '', is_correct: false }
        ]
    });

    const [isMounted, setIsMounted] = useState(true);

    const [selectedReview, setSelectedReview] = useState(null);

    const [showFlashcardTabs, setShowFlashcardTabs] = useState(true);

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [showDocumentEditor, setShowDocumentEditor] = useState(false);
    const [decks, setDecks] = useState([]); // <-- Add this line

    // Add this state at the top with other state declarations
    const [dueTodayCount, setDueTodayCount] = useState(0);
    const [upcomingCards, setUpcomingCards] = useState([]);

    // Add this state at the top with other state declarations
    const [viewMode, setViewMode] = useState('grid');

    // Function to check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    // Function to refresh the access token
    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
            });

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('jwt_token', data.access);
                return data.access;
            } else {
                console.error('Failed to refresh token:', await response.text());
                logout(); // Only logout if refresh fails
                return null;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout(); // Only logout if refresh fails
            return null;
        }
    };

    // Function to make authenticated requests with automatic token refresh
    const makeAuthenticatedRequest = async (url, options = {}) => {
        let token = sessionStorage.getItem('jwt_token');
        
        if (isTokenExpired(token)) {
            token = await refreshAccessToken();
            if (!token) return null; // If refresh failed, return null
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            // Try refreshing token once more
            token = await refreshAccessToken();
            if (!token) return null;

            // Retry the request with new token
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        }

        return response;
    };

    // Split fetchFolders into smaller functions
    const fetchAllDecks = async () => {
        const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/`);
        if (!response || !response.ok) return [];
        return await response.json();
    };

    const fetchAllQuizzes = async () => {
        const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}test/quiz/`);
        if (!response || !response.ok) return [];
        return await response.json();
    };

    const processFolderItems = (folder, allDecks, allQuizzes) => {
        const folderDecks = allDecks.filter(deck => deck.folder === folder.id);
        const folderQuizzes = allQuizzes.filter(quiz => quiz.folder === folder.id);
        
        const items = [
            ...folderDecks.map(deck => ({
                id: deck.id,
                type: 'deck',
                name: deck.title,
                subject: deck.subject
            })),
            ...folderQuizzes.map(quiz => ({
                id: quiz.id,
                type: 'quiz',
                topic: quiz.topic,
                subject: quiz.subject,
                folder: quiz.folder
            }))
        ];
        
        return {
            ...folder,
            deckCount: folderDecks.length,
            quizCount: folderQuizzes.length,
            items: items
        };
    };

    const fetchFolders = async () => {
        if (isLoading.initialLoad) {
            setIsLoading(prev => ({ ...prev, folders: true }));
        }
        try {
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}folders/user/`);
            if (!response || !isMounted) return;

            if (response.ok) {
                const foldersData = await response.json();
                
                // Process folders with their items and content_num
                const foldersWithCounts = foldersData.map(folder => {
                    return {
                        ...folder,
                        documentCount: folder.content_num || 0,
                        deckCount: 0,
                        quizCount: 0
                    };
                });

                setFolders(foldersWithCounts);

                // Update selected folder if needed
                if (selectedFolder && isMounted) {
                    const updatedSelectedFolder = foldersWithCounts.find(f => f.id === selectedFolder.id);
                    if (updatedSelectedFolder) {
                        setSelectedFolder(updatedSelectedFolder);
                    }
                }
            } else {
                console.error('Failed to fetch folders:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            if (isMounted) {
                setIsLoading(prev => ({ ...prev, folders: false, initialLoad: false }));
            }
        }
    };

    // Add cleanup for useEffect
    useEffect(() => {
        setIsMounted(true);
        fetchFolders();
        
        return () => {
            setIsMounted(false);
        };
    }, []);

    // Add cleanup for other useEffects
    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleCreateFolder = async () => {
        if (newFolderName.trim()) {
            try {
                const token = sessionStorage.getItem('jwt_token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}folders/user/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: newFolderName.trim() })
                });
                
                if (response.ok) {
                    const newFolder = await response.json();
                    setFolders([...folders, newFolder]);
                    setNewFolderName('');
                    setShowNewFolderModal(false);
                } else {
                    console.error('Failed to create folder:', await response.text());
                }
            } catch (error) {
                console.error('Error creating folder:', error);
            }
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            const folder = folders.find(f => f.id === folderId);
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}folders/user/${folderId}/`, {
                method: 'DELETE'
            });
            
            if (!response) return;

            if (response.ok) {
                setFolders(folders.filter(f => f.id !== folderId));
                showNotification(`${folder.name} successfully deleted`);
                
                // If we're currently viewing the deleted folder, go back to the last visited page
                if (selectedFolder?.id === folderId) {
                    // Find the last valid navigation state
                    for (let i = navHistory.length - 1; i >= 0; i--) {
                        const prevState = navHistory[i];
                        if (prevState.view !== 'folder' || prevState.folder?.id !== folderId) {
                            handleNavigation(prevState.view, prevState.folder, prevState.deck);
                            break;
                        }
                    }
                }
            } else {
                console.error('Failed to delete folder:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    useEffect(() => {
        // Check if this is the user's first login
        const lastLogin = localStorage.getItem('lastLogin');
        const isFirstLogin = !lastLogin;
        
        setIsNewUser(isFirstLogin);
        showNotification(isFirstLogin ? `Welcome ${user?.email?.split('@')[0]}` : 'Welcome Back!');

        // Store the current login time
        localStorage.setItem('lastLogin', new Date().toISOString());
    }, []);

    const handleAddItem = (folderId, itemType) => {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                const newItem = itemType === 'deck' ? {
                    id: Date.now(),
                    type: 'deck',
                    name: `New deck`,
                    subject: ''
                } : {
                    id: Date.now(), // Temporary ID; in real use, backend should provide this
                    type: 'quiz',
                    topic: 'New quiz',
                    subject: '',
                    folder: folderId
                };
    
                return {
                    ...folder,
                    items: [...folder.items, newItem]
                };
            }
            return folder;
        }));
    };

    // Placeholder handlers for the new icons
    const handleShare = () => {
        
        // Implement share functionality
    };

    const handleStar = () => {
        
        // Implement star functionality
    };

    const handleSettings = () => {
        
        // Implement settings functionality
    };

    const handleCollab = () => {
        
        // Implement collaboration functionality
    };

    const getCurrentViewTitle = () => {
        if (activeView === 'dashboard') {
            return 'Dashboard Overview';
        } else if (activeView === 'folder' && selectedFolder) {
            return `Folder • ${selectedFolder.name}`;
        } else if (activeView === 'deck' && selectedDeck) {
            return `Deck • ${selectedDeck.name}`;
        } else if (activeView === 'flashcards') {
            return 'Flashcards';
        } else {
            return '';
        }
    };

    const toggleFolder = async (folderId, e) => {
        e.stopPropagation(); // Prevent folder selection when clicking expand button
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));

        // If we're expanding the folder, fetch its contents
        if (!expandedFolders[folderId]) {
            try {
                // Fetch all necessary data in parallel
                const [documentsResponse, allDecks, allQuizzes] = await Promise.all([
                    makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}documents/notes/`),
                    fetchAllDecks(),
                    fetchAllQuizzes()
                ]);

                if (!isMounted) return;

                // Get all items for the folder
                let allDocuments = [];
                if (documentsResponse && documentsResponse.ok) {
                    allDocuments = await documentsResponse.json();
                }

                const folderDocuments = allDocuments.filter(doc => doc.folder === folderId);
                const folderDecks = allDecks.filter(deck => deck.folder === folderId);
                const folderQuizzes = allQuizzes.filter(quiz => quiz.folder === folderId);

                const items = [
                    ...folderDocuments.map(doc => ({
                        id: doc.id,
                        type: 'document',
                        title: doc.title,
                        created_at: doc.created_at
                    })),
                    ...folderDecks.map(deck => ({
                        id: deck.id,
                        type: 'deck',
                        name: deck.title,
                        subject: deck.subject
                    })),
                    ...folderQuizzes.map(quiz => ({
                        id: quiz.id,
                        type: 'quiz',
                        topic: quiz.topic,
                        subject: quiz.subject,
                        folder: quiz.folder
                    }))
                ];

                // Update the folder's items in the folders list
                setFolders(prevFolders => 
                    prevFolders.map(f => {
                        if (f.id === folderId) {
                            return {
                                ...f,
                                items: items
                            };
                        }
                        return f;
                    })
                );
            } catch (error) {
                console.error('Error fetching folder contents:', error);
            }
        }
    };

    const handleQuizClick = async (quizId, e) => {
        try {
            // Start transition
            setIsTransitioning(true);
            
            // Wait for transition
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}test/quiz/${quizId}/`);
            if (!response) return;

            if (response.ok) {
                const quizData = await response.json();
                setSelectedQuiz(quizData);
                
                // Fetch questions for the quiz
                const questions = await fetchQuizQuestions(quizId);
                if (questions) {
                    setQuizQuestions(questions);
                }
                
                handleNavigation('quiz', selectedFolder, null, quizData);
                
                // End transition
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 50);
            } else {
                console.error('Failed to fetch quiz:', await response.text());
                setIsTransitioning(false);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setIsTransitioning(false);
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
    };

    const handleSaveQuestion = async (updatedQuestion) => {
        try {
            // Update the question
            const questionResponse = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/question/${selectedQuiz.id}/${updatedQuestion.id}/`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        question_input: updatedQuestion.question,
                        question_type: "MC", // Changed to match model choices
                        quiz_id: selectedQuiz.id
                    })
                }
            );

            if (!questionResponse || !questionResponse.ok) {
                const errorText = await questionResponse.text();
                console.error('Failed to update question:', errorText);
                showNotification('Failed to update question: ' + errorText);
                return;
            }

            // Update each answer
            for (const option of updatedQuestion.options) {
                const answerResponse = await makeAuthenticatedRequest(
                    `${import.meta.env.VITE_API_URL}test/quiz/answer/${selectedQuiz.id}/${updatedQuestion.id}/`,
                    {
                        method: 'PUT',
                        body: JSON.stringify({
                            answer_input: option,
                            answer_is_correct: option === updatedQuestion.correctAnswer,
                            question_id: updatedQuestion.id,
                            quiz_id: selectedQuiz.id
                        })
                    }
                );

                if (!answerResponse || !answerResponse.ok) {
                    const errorText = await answerResponse.text();
                    console.error('Failed to update answer:', errorText);
                    showNotification('Failed to update answer: ' + errorText);
                }
            }

            // Refresh the quiz data
            const quizResponse = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/${selectedQuiz.id}/`
            );

            if (quizResponse && quizResponse.ok) {
                const updatedQuiz = await quizResponse.json();
                setSelectedQuiz(updatedQuiz);
                setEditingQuestion(null);
                showNotification('Question updated successfully');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            showNotification('Error updating question: ' + error.message);
        }
    };

    const handleAddQuestion = () => {
        setNewQuestion({
            question_input: '',
            question_type: 'MC',
            answers: [
                { answer_input: '', is_correct: false }
            ]
        });
        setShowNewQuestionModal(true);
    };

    const handleAddAnswer = () => {
        setNewQuestion(prev => ({
            ...prev,
            answers: [...prev.answers, { answer_input: '', is_correct: false }]
        }));
    };

    const handleRemoveAnswer = (index) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.filter((_, i) => i !== index)
        }));
    };

    const handleAnswerChange = (index, field, value) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.map((answer, i) => 
                i === index ? { ...answer, [field]: value } : answer
            )
        }));
    };

    const handleCreateQuestion = async () => {
        try {
            // Validate question
            if (!newQuestion.question_input.trim()) {
                showNotification('Please enter a question');
                return;
            }

            // Validate answers
            if (newQuestion.answers.length === 0) {
                showNotification('Please add at least one answer');
                return;
            }

            if (newQuestion.answers.some(answer => !answer.answer_input.trim())) {
                showNotification('Please fill in all answers');
                return;
            }

            if (!newQuestion.answers.some(answer => answer.is_correct)) {
                showNotification('Please mark at least one answer as correct');
                return;
            }

            // Create the question
            const questionResponse = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/question/`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        question_input: newQuestion.question_input,
                        question_type: newQuestion.question_type,
                        quiz_id: selectedQuiz.id
                    })
                }
            );

            if (!questionResponse || !questionResponse.ok) {
                const errorText = await questionResponse.text();
                console.error('Failed to create question:', errorText);
                showNotification('Failed to create question: ' + errorText);
                return;
            }

            const questionData = await questionResponse.json();
            
            // Create answers
            for (const answer of newQuestion.answers) {
                const answerResponse = await makeAuthenticatedRequest(
                    `${import.meta.env.VITE_API_URL}test/quiz/answer/`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            answer_input: answer.answer_input,
                            answer_is_correct: answer.is_correct,
                            question_id: questionData.id,
                            quiz_id: selectedQuiz.id
                        })
                    }
                );

                if (!answerResponse || !answerResponse.ok) {
                    const errorText = await answerResponse.text();
                    console.error('Failed to create answer:', errorText);
                    showNotification('Failed to create answer: ' + errorText);
                }
            }

            // Refresh the quiz data
            const quizResponse = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/${selectedQuiz.id}/`
            );

            if (quizResponse && quizResponse.ok) {
                const updatedQuiz = await quizResponse.json();
                setSelectedQuiz(updatedQuiz);
                setShowNewQuestionModal(false);
                showNotification('Question added successfully');
            }
        } catch (error) {
            console.error('Error creating question:', error);
            showNotification('Error creating question: ' + error.message);
        }
    };

    const handleContextMenu = (e, type, id) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            type,
            id
        });
    };

    const handleClick = () => {
        setContextMenu({ show: false, x: 0, y: 0, type: null, id: null });
    };

    const fetchFolderDecks = async (folderId) => {
        if (isLoading.initialLoad) {
            setIsLoading(prev => ({ ...prev, decks: true }));
        }
        try {
            const folder = folders.find(f => f.id === folderId);
            if (!folder) {
                console.error('Folder not found');
                return;
            }

            // Get existing items from the folder
            const existingItems = folder.items || [];
            console.log('Existing items before fetch:', existingItems);

            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/`);
            
            if (!response) return;

            if (response.ok) {
                const allDecks = await response.json();
                
                // Filter decks to only include those that belong to this folder
                const folderDecks = allDecks.filter(deck => deck.folder === folderId);
                
                // Fetch all cards to get accurate counts
                const cardsResponse = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/cards/`);
                if (!cardsResponse) return;

                if (cardsResponse.ok) {
                    const allCards = await cardsResponse.json();
                    setCards(allCards);

                    // Map decks with their card counts
                    const mappedDecks = folderDecks.map(deck => ({
                        id: deck.id,
                        type: 'deck',
                        name: deck.title,
                        subject: deck.subject,
                        cardCount: allCards.filter(card => card.card_deck === deck.id).length
                    }));

                    // Preserve existing items that aren't decks
                    const existingNonDeckItems = existingItems.filter(item => item.type !== 'deck');
                    const updatedItems = [...mappedDecks, ...existingNonDeckItems];
                    console.log('Updated items after fetch:', updatedItems);

                    // Update selected folder while preserving existing items
                    setSelectedFolder(prevFolder => {
                        if (prevFolder && prevFolder.id === folderId) {
                            return {
                                ...prevFolder,
                                items: updatedItems,
                                deckCount: folderDecks.length
                            };
                        }
                        return prevFolder;
                    });

                    // Update folders state while preserving existing items
                    setFolders(prevFolders => 
                        prevFolders.map(f => {
                            if (f.id === folderId) {
                                return {
                                    ...f,
                                    items: updatedItems,
                                    deckCount: folderDecks.length
                                };
                            }
                            return f;
                        })
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching decks:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, decks: false }));
        }
    };

    const handleFolderClick = async (folderId, e) => {
        // Prevent handling if this is a double click
        if (e.detail > 1) return;
        
        const folder = folders.find(f => f.id === folderId);
        console.log('Initial folder state:', folder);
        
        // Start transition
        setIsTransitioning(true);
        
        // Clear any existing timeout
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }
        
        try {
            // Fetch both documents and quizzes in parallel
            const [documentsResponse, quizzesResponse] = await Promise.all([
                makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}documents/notes/${folderId}/`),
                makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}test/quiz/`)
            ]);
            
            let folderDocuments = [];
            let folderQuizzes = [];

            if (documentsResponse && documentsResponse.ok) {
                folderDocuments = await documentsResponse.json();
                console.log('Fetched documents:', folderDocuments);
            }

            if (quizzesResponse && quizzesResponse.ok) {
                const allQuizzes = await quizzesResponse.json();
                folderQuizzes = allQuizzes.filter(quiz => quiz.folder === folderId);
                console.log('Fetched quizzes:', folderQuizzes);
            }

            // Get existing items that aren't documents or quizzes
            const existingItems = folder.items || [];
            const existingNonDocQuizItems = existingItems.filter(item => 
                item.type !== 'document' && item.type !== 'quiz'
            );

            // Create the updated folder with all items
            const updatedFolder = {
                ...folder,
                items: [
                    ...folderDocuments.map(doc => ({
                        id: doc.id,
                        type: 'document',
                        title: doc.title,
                        created_at: doc.created_at
                    })),
                    ...folderQuizzes.map(quiz => ({
                        id: quiz.id,
                        type: 'quiz',
                        topic: quiz.topic,
                        subject: quiz.subject,
                        folder: quiz.folder
                    })),
                    ...existingNonDocQuizItems
                ]
            };
            console.log('Updated folder with items:', updatedFolder);

            // Update the folders state
            setFolders(prevFolders => {
                const newFolders = prevFolders.map(f => {
                    if (f.id === folderId) {
                        return updatedFolder;
                    }
                    return f;
                });
                console.log('New folders state:', newFolders);
                return newFolders;
            });
        
        // Set new timeout
        const timeout = setTimeout(() => {
            setIsTransitioning(false);
        }, 300); // 300ms transition
        
        setTransitionTimeout(timeout);
        
            // Update the selected folder and view
            console.log('Setting selected folder to:', updatedFolder);
            setSelectedFolder(updatedFolder);
            setActiveView('folder');
        } catch (error) {
            console.error('Error fetching folder contents:', error);
            setIsTransitioning(false);
        }
    };

    // Modify the useEffect to not fetch folder decks when we already have items
    useEffect(() => {
        if (selectedFolder && activeView === 'folder' && (!selectedFolder.items || selectedFolder.items.length === 0)) {
            fetchFolderDecks(selectedFolder.id);
        }
    }, [selectedFolder?.id, activeView]);

    const handleCreateDeck = async () => {
        if (newDeckName.trim() && newDeckSubject.trim()) {
            try {
                const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: newDeckName.trim(),
                        subject: newDeckSubject.trim(),
                        folder_id: selectedFolder.id
                    })
                });
                
                if (!response) return;

                if (response.ok) {
                    const createdDeck = await response.json();
                    console.log('Created deck response:', createdDeck);

                    // Create the deck item with all necessary fields
                    const newDeckItem = {
                        id: createdDeck.id,
                        type: 'deck',
                        name: createdDeck.title,
                        subject: createdDeck.subject,
                        cardCount: 0
                    };

                    // Update the folder's items to include the new deck
                    setSelectedFolder(prevFolder => {
                        const updatedItems = [...(prevFolder.items || []), newDeckItem];
                        return {
                            ...prevFolder,
                            items: updatedItems,
                            deckCount: (prevFolder.deckCount || 0) + 1
                        };
                    });

                    // Update folders state
                    setFolders(prevFolders => 
                        prevFolders.map(folder => {
                            if (folder.id === selectedFolder.id) {
                                return {
                                    ...folder,
                                    items: [...(folder.items || []), newDeckItem],
                                    deckCount: (folder.deckCount || 0) + 1
                                };
                            }
                            return folder;
                        })
                    );

                    setNewDeckName('');
                    setNewDeckSubject('');
                    setShowNewDeckModal(false);
                    showNotification('Deck created successfully');
                } else {
                    const errorText = await response.text();
                    console.error('Failed to create deck:', errorText);
                    showNotification('Failed to create deck: ' + errorText);
                }
            } catch (error) {
                console.error('Error creating deck:', error);
                showNotification('Error creating deck');
            }
        }
    };

    const handleDeleteDeck = async (deckId) => {
        try {
            const deck = selectedFolder.items.find(item => item.id === deckId);
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/delete/${deckId}`, {
                method: 'DELETE'
            });
            
            if (!response) return;

            if (response.ok) {
                // If we're in the deck view, navigate back to the last visited page
                if (activeView === 'deck' && selectedDeck?.id === deckId) {
                    // Find the last valid navigation state
                    for (let i = navHistory.length - 1; i >= 0; i--) {
                        const prevState = navHistory[i];
                        if (prevState.view !== 'deck' || prevState.deck?.id !== deckId) {
                            handleNavigation(prevState.view, prevState.folder, prevState.deck);
                            break;
                        }
                    }
                }
                // Refresh the folder contents to show updated deck list
                await fetchFolderDecks(selectedFolder.id);
                showNotification(`${deck.name} successfully deleted`);
            } else {
                console.error('Failed to delete deck:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting deck:', error);
        }
    };

    const fetchDeckCards = async (deckId) => {
        setIsLoading(prev => ({ ...prev, cards: true }));
        try {
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/cards/`);
            if (!response) return;

            if (response.ok) {
                const allCards = await response.json();
                const deckCards = allCards.filter(card => card.card_deck === deckId);
                setCards(deckCards);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, cards: false }));
        }
    };

    const handleDeckClick = async (deckId, e) => {
        // Prevent handling if this is a double click
        if (e.detail > 1) return;
        
        // Start transition
        setIsTransitioning(true);
        
        // Clear any existing timeout
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }
        
        try {
            // Find the deck in any folder
            let targetFolder = null;
            let targetDeck = null;
            
            // Search through all folders to find the deck
            for (const folder of folders) {
                const deck = folder.items?.find(item => item.id === deckId);
                if (deck) {
                    targetFolder = folder;
                    targetDeck = deck;
                    break;
                }
            }
            
            if (!targetDeck || !targetFolder) {
                console.error('Deck not found');
                return;
            }

            // Update the view and selected deck immediately
            handleNavigation('deck', targetFolder, targetDeck, null);
            
            // Set transition timeout immediately
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
            }, 300); // 300ms transition
            
            setTransitionTimeout(timeout);
            
            // Fetch data after transition starts
            if (selectedFolder?.id !== targetFolder.id) {
                await fetchFolderDecks(targetFolder.id);
            }
            await fetchDeckCards(deckId);
            
        } catch (error) {
            console.error('Error switching to deck:', error);
            setIsTransitioning(false);
        }
    };

    const handleCreateCard = async () => {
        if (newCard.question.trim() && newCard.answer.trim()) {
            try {
                const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/cards/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        question: newCard.question.trim(),
                        answer: newCard.answer.trim(),
                        deck_id: selectedDeck.id,
                        scheduled_date: newCard.scheduled_date
                    })
                });
                
                if (!response) return;

                if (response.ok) {
                    const createdCard = await response.json();
                    setCards([...cards, createdCard]);
                    setNewCard({ question: '', answer: '', scheduled_date: '' });
                    setShowNewCardModal(false);
                } else {
                    console.error('Failed to create card:', await response.text());
                }
            } catch (error) {
                console.error('Error creating card:', error);
            }
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            const card = cards.find(c => c.id === cardId);
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}flashcards/cards/delete/${selectedDeck.id}/${cardId}/`,
                { method: 'DELETE' }
            );
            
            if (!response) return;

            if (response.ok) {
                setCards(cards.filter(card => card.id !== cardId));
                showNotification(`Card successfully deleted`);
            } else {
                console.error('Failed to delete card:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    // Function to handle navigation
    const handleNavigation = async (view, folder = null, deck = null, quiz = null) => {
        if (view === 'folder' && folder) {
            try {
                // Fetch all necessary data in parallel
                const [documentsResponse, allDecks, allQuizzes, foldersResponse] = await Promise.all([
                    makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}documents/notes/`),
                    fetchAllDecks(),
                    fetchAllQuizzes(),
                    makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}folders/user/`)
                ]);

                if (!isMounted) return;

                // Update folders list with server data
                if (foldersResponse && foldersResponse.ok) {
                    const foldersData = await foldersResponse.json();
                    setFolders(foldersData);
                    
                    // Get the updated folder from server data
                    const updatedFolder = foldersData.find(f => f.id === folder.id);
                    if (updatedFolder) {
                        setSelectedFolder(updatedFolder);
                    }
                }

                // Get all items for the folder
                let allDocuments = [];
                if (documentsResponse && documentsResponse.ok) {
                    allDocuments = await documentsResponse.json();
                }

                const folderDocuments = allDocuments.filter(doc => doc.folder === folder.id);
                const folderDecks = allDecks.filter(deck => deck.folder === folder.id);
                const folderQuizzes = allQuizzes.filter(quiz => quiz.folder === folder.id);

                const items = [
                    ...folderDocuments.map(doc => ({
                        id: doc.id,
                        type: 'document',
                        title: doc.title,
                        created_at: doc.created_at
                    })),
                    ...folderDecks.map(deck => ({
                        id: deck.id,
                        type: 'deck',
                        name: deck.title,
                        subject: deck.subject
                    })),
                    ...folderQuizzes.map(quiz => ({
                        id: quiz.id,
                        type: 'quiz',
                        topic: quiz.topic,
                        subject: quiz.subject,
                        folder: quiz.folder
                    }))
                ];

                // Update the selected folder with items but keep server's content_num
                const updatedFolder = {
                    ...folder,
                    items: items
                };

                setSelectedFolder(updatedFolder);
                setActiveView('folder');
                setSelectedDocument(null);
                setSelectedDeck(null);
                setSelectedQuiz(null);
            } catch (error) {
                console.error('Error fetching folder content:', error);
            }
        } else {
        setActiveView(view);
        setSelectedFolder(folder);
        setSelectedDeck(deck);
        setSelectedQuiz(quiz);
            setSelectedDocument(null);
        }
    };

    // Function to go back
    const handleBack = () => {
        if (currentNavIndex > 0) {
            const prevState = navHistory[currentNavIndex - 1];
            setCurrentNavIndex(currentNavIndex - 1);
            setActiveView(prevState.view);
            setSelectedFolder(prevState.folder);
            setSelectedDeck(prevState.deck);
            setSelectedQuiz(prevState.quiz);
            
            // If we're going back to a folder view, ensure we have all items
            if (prevState.view === 'folder' && prevState.folder) {
                const updatedFolder = folders.find(f => f.id === prevState.folder.id);
                if (updatedFolder) {
                    setSelectedFolder(updatedFolder);
                }
            }
        }
    };

    // Function to go forward
    const handleForward = () => {
        if (currentNavIndex < navHistory.length - 1) {
            const nextState = navHistory[currentNavIndex + 1];
            setCurrentNavIndex(currentNavIndex + 1);
            setActiveView(nextState.view);
            setSelectedFolder(nextState.folder);
            setSelectedDeck(nextState.deck);
            setSelectedQuiz(nextState.quiz);
            
            // If we're going forward to a folder view, ensure we have all items
            if (nextState.view === 'folder' && nextState.folder) {
                const updatedFolder = folders.find(f => f.id === nextState.folder.id);
                if (updatedFolder) {
                    setSelectedFolder(updatedFolder);
                }
            }
        }
    };

    // Update all navigation handlers to use handleNavigation
    const handleDashboardClick = () => {
        handleNavigation('dashboard', null, null);
    };

    // Update the sidebar navigation
    const handleSidebarNav = (view) => {
        handleNavigation(view, null, null);
    };

    // Function to handle settings dropdown
    const handleSettingsClick = (e) => {
        e.stopPropagation();
        setShowSettingsDropdown(!showSettingsDropdown);
    };

    // Function to handle click outside dropdown
    const handleClickOutside = (e) => {
        if (!e.target.closest('.settings-dropdown') && !e.target.closest('.action-icon-button')) {
            setShowSettingsDropdown(false);
        }
    };

    // Function to show notification
    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: '' });
        }, 3000); // Hide after 3 seconds
    };

    // Function to handle delete based on current view
    const handleDelete = async () => {
        setIsLoading(prev => ({ ...prev, delete: true }));
        try {
            if (activeView === 'folder' && selectedFolder) {
                await handleDeleteFolder(selectedFolder.id);
                handleNavigation('dashboard', null, null);
                showNotification(`${selectedFolder.name} successfully deleted`);
            } else if (activeView === 'deck' && selectedDeck) {
                await handleDeleteDeck(selectedDeck.id);
                handleNavigation('folder', selectedFolder, null);
                showNotification(`${selectedDeck.name} successfully deleted`);
            }
        } finally {
            setIsLoading(prev => ({ ...prev, delete: false }));
            setShowSettingsDropdown(false);
        }
    };

    const handleCreateDocument = async () => {
        if (!selectedFolder) return;

            try {
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}documents/notes/${selectedFolder.id}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: 'Untitled',
                        notes: '',
                        folder: selectedFolder.id
                    })
                }
            );
                
                if (!response) return;

                if (response.ok) {
                const newDocument = await response.json();
                
                // Fetch updated folder data
                const folderResponse = await makeAuthenticatedRequest(
                    `${import.meta.env.VITE_API_URL}folders/user/`
                );

                if (folderResponse && folderResponse.ok) {
                    const foldersData = await folderResponse.json();
                    const updatedFolder = foldersData.find(f => f.id === selectedFolder.id);
                    
                    if (updatedFolder) {
                        // Update the selected folder with fresh data
                        setSelectedFolder(updatedFolder);
                        
                        // Update the folders list
                        setFolders(foldersData);

                        // Fetch folder content
                        await handleFolderClick(selectedFolder.id);
                        
                        // Navigate to document view with the new document
                        setSelectedDocument(newDocument);
                        setActiveView('document');
                        showNotification('Document created successfully');
                    }
                }
            } else {
                console.error('Failed to create document:', await response.text());
            }
        } catch (error) {
            console.error('Error creating document:', error);
            showNotification('Error creating document');
        }
    };

    const handleCreateQuiz = async () => {
        if (!selectedFolder) return;

        try {
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic: newQuiz.topic.trim(),
                        subject: newQuiz.subject.trim(),
                        folder_id: selectedFolder.id
                    })
                }
            );

            if (!response) return;

            if (response.ok) {
                const createdQuiz = await response.json();

                    // Clear the form and close modal
                    setNewQuiz({ topic: '', subject: '' });
                    setShowNewQuizModal(false);

                // Fetch updated folder data
                const folderResponse = await makeAuthenticatedRequest(
                    `${import.meta.env.VITE_API_URL}folders/user/`
                );

                if (folderResponse && folderResponse.ok) {
                    const foldersData = await folderResponse.json();
                    const updatedFolder = foldersData.find(f => f.id === selectedFolder.id);
                    
                    if (updatedFolder) {
                        // Update both the selected folder and folders list with server data
                        setSelectedFolder(updatedFolder);
                        setFolders(foldersData);

                        // Navigate back to folder view
                        handleNavigation('folder', updatedFolder);
                    showNotification('Quiz created successfully');
                    }
                }
                } else {
                console.error('Failed to create quiz:', await response.text());
                }
            } catch (error) {
                console.error('Error creating quiz:', error);
                showNotification('Error creating quiz');
        }
    };

    // Add handleDeleteQuiz function
    const handleDeleteQuiz = async (quizId) => {
        if (!quizId) {
            console.error('No quiz ID provided for deletion');
            showNotification('Error: No quiz ID provided');
            return;
        }

        try {
            console.log('Attempting to delete quiz with ID:', quizId);
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}test/quiz/${quizId}/`, {
                method: 'DELETE'
            });
            
            if (!response) return;

            if (response.ok) {
                // If we're currently viewing the quiz, go back to the last visited page
                if (activeView === 'quiz' && selectedQuiz?.id === quizId) {
                    // Find the last valid navigation state
                    for (let i = navHistory.length - 1; i >= 0; i--) {
                        const prevState = navHistory[i];
                        if (prevState.view !== 'quiz' || prevState.quiz?.id !== quizId) {
                            handleNavigation(prevState.view, prevState.folder, prevState.deck);
                            break;
                        }
                    }
                }

                // Update the folder's items to remove the deleted quiz
                setSelectedFolder(prevFolder => ({
                    ...prevFolder,
                    items: prevFolder.items.filter(item => item.id !== quizId),
                    quizCount: (prevFolder.quizCount || 0) - 1
                }));

                // Update folders state
                setFolders(prevFolders => 
                    prevFolders.map(folder => {
                        if (folder.id === selectedFolder.id) {
                            return {
                                ...folder,
                                items: folder.items.filter(item => item.id !== quizId),
                                quizCount: (folder.quizCount || 0) - 1
                            };
                        }
                        return folder;
                    })
                );

                showNotification('Quiz deleted successfully');
            } else {
                const errorText = await response.text();
                console.error('Failed to delete quiz:', errorText);
                showNotification('Failed to delete quiz: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            showNotification('Error deleting quiz');
        }
    };

    // Add this function to fetch questions for a quiz
    const fetchQuizQuestions = async (quizId) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}test/quiz/question/${quizId}/`
            );

            if (response && response.ok) {
                const questionsData = await response.json();
                console.log('Fetched questions:', questionsData); // Debug log
                return questionsData;
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            showNotification('Error fetching questions: ' + error.message);
        }
        return null;
    };

    const handleReviewCardsViewModeChange = (viewMode, selectedDeck) => {
        setShowFlashcardTabs(viewMode !== 'deck-details');
    };

    // Add this function to handle document click
    const handleDocumentClick = (document) => {
        // Ensure we have the latest folder data
        const updatedFolder = folders.find(f => f.id === selectedFolder.id);
        if (updatedFolder) {
            setSelectedFolder(updatedFolder);
        }
        setSelectedDocument(document);
        setActiveView('document');
    };

    const renderFolderItems = (folder) => {
        if (!folder.items || folder.items.length === 0) {
            return (
                <div className="empty-folder-content">
                    <p>No items in this folder</p>
                    <div className="empty-folder-actions">
                        <button 
                            className="add-item-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateDocument();
                            }}
                        >
                            <FiFileText /> Add Document
                        </button>
                        <button 
                            className="add-item-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNewQuizModal(true);
                            }}
                        >
                            <FiFileText /> Add Quiz
                        </button>
                    </div>
                </div>
            );
        }

        return folder.items.map(item => {
            if (item.type === 'document') {
                return (
                    <div 
                        key={item.id} 
                        className={`folder-content-item ${selectedDocument?.id === item.id && activeView === 'document' ? 'active' : ''}`}
                        onClick={() => handleDocumentClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, 'document', item.id)}
                    >
                        <FiFileText className="content-icon" />
                        <span className="content-name">{item.title}</span>
                        <div className="item-meta">
                            <span className="item-tag">Document</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="item-actions">
                            <button 
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(item.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                );
            } else if (item.type === 'quiz') {
                return (
                    <div 
                        key={item.id} 
                        className={`folder-content-item ${selectedQuiz?.id === item.id && activeView === 'quiz' ? 'active' : ''}`}
                        onClick={(e) => handleQuizClick(item.id, e)}
                        onContextMenu={(e) => handleContextMenu(e, 'quiz', item.id)}
                    >
                        <FiFileText className="content-icon" />
                        <span className="content-name">{item.topic}</span>
                        <div className="item-meta">
                            <span className="item-tag">Quiz</span>
                            <span>{item.subject}</span>
                        </div>
                        <div className="item-actions">
                            <button 
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteQuiz(item.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                );
            }
            return null;
        });
    };

    // Add useEffect to monitor state changes
    useEffect(() => {
        console.log('Selected folder changed:', selectedFolder);
    }, [selectedFolder]);

    useEffect(() => {
        console.log('Folders state changed:', folders);
    }, [folders]);

    const renderContent = () => {
        console.log('Rendering content with activeView:', activeView);
        console.log('Selected folder in renderContent:', selectedFolder);
        
        if (activeView === 'document' && selectedDocument) {
            return (
                <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                    <DocumentEditor
                        folderId={selectedFolder?.id}
                        onClose={() => {
                            setActiveView('folder');
                            setSelectedDocument(null);
                        }}
                        documentId={selectedDocument.id}
                    />
                </div>
            );
        }

        if (activeView === 'folder' && selectedFolder) {
            return (
                <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                    <div className="folder-content-header">
                        <h2>{selectedFolder.name}</h2>
                        <div className="folder-tools">
                            <div className="folder-search">
                                <FiSearch />
                                <input type="text" placeholder="Search in this folder..." />
                            </div>
                            <div className="folder-filters">
                                <button className="filter-btn">All</button>
                                <button className="filter-btn">Documents</button>
                                <button className="filter-btn">Quizzes</button>
                            </div>
                            <div className="layout-toggles">
                                <button 
                                    className={`layout-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <FiGrid />
                                </button>
                                <button 
                                    className={`layout-toggle ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <FiList />
                                </button>
                            </div>
                        </div>
                        <div className="add-item-buttons">
                            <button 
                                className="add-item-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateDocument();
                                }}
                            >
                                <FiFileText /> Add Document
                            </button>
                            <button 
                                className="add-item-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNewQuizModal(true);
                                }}
                            >
                                <FiFileText /> Add Quiz
                            </button>
                        </div>
                    </div>
                    {isLoading.initialLoad ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <div className={`folder-items ${viewMode}-view`}>
                            {renderFolderItems(selectedFolder)}
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'dashboard' || activeView === 'Home') {
            return (
                <DashboardHome />
            );
        }

        if (activeView === 'flashcards') {
            return (
                <div className="nightowl-flashcards-bg">
                  <div className="nightowl-flashcards-content">
                    {/* Header & Mascot */}
                    <div className="nightowl-header-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <span className="nightowl-panel-icon" role="img" aria-label="owl">🦉</span>
                        <div>
                          <div className="nightowl-header-title">Night Owl Flashcards</div>
                          <div className="nightowl-header-sub">Study late, focus deep, and let your ideas glow.</div>
                        </div>
                      </div>
                      <button className="nightowl-studyroom-btn" onClick={() => navigate('/study-room')}>
                        <span role="img" aria-label="moon">🌙</span> Enter Study Room
                      </button>
                    </div>

                    {/* Status Widget (XP, Streak, etc) */}
                    <div className="nightowl-status-widget">
                      <span className="nightowl-xp-moon" role="img" aria-label="moon">🌙</span>
                      <span className="nightowl-xp-label">XP</span>
                      <div className="nightowl-xp-bar">
                        <div className="nightowl-xp-fill" style={{width: '68%'}}></div>
                      </div>
                      <span className="nightowl-xp-label">Level 4</span>
                    </div>

                    {/* Card Grid */}
                    <div className="nightowl-panel-grid">
                      <div className="nightowl-panel">
                        <span className="nightowl-panel-icon" role="img" aria-label="deck">📚</span>
                        <div className="nightowl-panel-title">Total Decks</div>
                        <div className="nightowl-panel-value">{decks?.length || 0}</div>
                        <div className="nightowl-panel-label">Decks Created</div>
                      </div>
                      <div className="nightowl-panel">
                        <span className="nightowl-panel-icon" role="img" aria-label="cards">🗂️</span>
                        <div className="nightowl-panel-title">Total Cards</div>
                        <div className="nightowl-panel-value">{getTotalCards()}</div>
                        <div className="nightowl-panel-label">Cards in All Decks</div>
                      </div>
                      <div className="nightowl-panel">
                        <span className="nightowl-panel-icon" role="img" aria-label="alarm">⏰</span>
                        <div className="nightowl-panel-title">Due Today</div>
                        <div className="nightowl-panel-value">{dueTodayCount}</div>
                        <div className="nightowl-panel-label">Cards to Review</div>
                      </div>
                      <div className="nightowl-panel">
                        <span className="nightowl-panel-icon" role="img" aria-label="fire">🔥</span>
                        <div className="nightowl-panel-title">Current Streak</div>
                        <div className="nightowl-panel-value">0 days</div>
                        <div className="nightowl-panel-label">Daily Study</div>
                      </div>
                    </div>

                    {/* Upcoming Review Widget */}
                    <div className="upcoming-review-widget">
                      <div className="upcoming-review-widget-title">Upcoming Reviews (Next 7 Days)</div>
                      <div className="upcoming-review-widget-content">
                        {upcomingCards.map((card) => (
                          <div key={card.id} className="upcoming-review-item">
                            <span className="upcoming-review-item-question">{card.question}</span>
                            <span className="upcoming-review-item-deck">{card.deckTitle}</span>
                            <span className="upcoming-review-item-date">Review Date: {new Date(card.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sticky Note (minimal) */}
                    <div className="nightowl-sticky">
                      <span role="img" aria-label="pin">📌</span> Study Tip: Try reviewing cards in small batches for better retention.
                    </div>

                    {/* Tools/Shortcuts */}
                    <div className="nightowl-tools-grid">
                      <button className="nightowl-tool-btn"><span role="img" aria-label="plus">➕</span> New Deck</button>
                      <button className="nightowl-tool-btn"><span role="img" aria-label="zap">⚡</span> Quick Review</button>
                      <button className="nightowl-tool-btn"><span role="img" aria-label="chart">📊</span> View Stats</button>
                    </div>
                  </div>
                </div>
            );
        }

        return null;
    };

    // Update the folder count display in the sidebar
    const getFolderItemCount = (folder) => {
        if (!folder.items) return 0;
        return folder.items.length;
    };

    // Add handleDeleteDocument function
    const handleDeleteDocument = async (documentId) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}documents/notes/${selectedFolder.id}/${documentId}/`,
                { method: 'DELETE' }
            );
            
            if (!response) return;

            if (response.ok) {
                // Update the folder's items
                setSelectedFolder(prevFolder => ({
                    ...prevFolder,
                    items: prevFolder.items.filter(item => item.id !== documentId)
                }));

                // Update folders state
                setFolders(prevFolders => 
                    prevFolders.map(folder => {
                        if (folder.id === selectedFolder.id) {
                            return {
                                ...folder,
                                items: folder.items.filter(item => item.id !== documentId)
                            };
                        }
                        return folder;
                    })
                );

                showNotification('Document deleted successfully');
            } else {
                console.error('Failed to delete document:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showNotification('Error deleting document');
        }
    };

    useEffect(() => {
        const fetchDecks = async () => {
            const token = sessionStorage.getItem('jwt_token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:8000/api/flashcards/deck/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched decks:', data); // Debug log
                    setDecks(data);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch decks:', errorText);
                }
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        };

        fetchDecks();
    }, []);

    // Add useEffect to handle background changes
    useEffect(() => {
        const body = document.body;
        const html = document.documentElement;
        if (activeView === 'flashcards') {
            body.classList.add('nightowl-root-bg');
            html.classList.add('nightowl-root-bg');
        } else {
            body.classList.remove('nightowl-root-bg');
            html.classList.remove('nightowl-root-bg');
        }

        // Cleanup function
        return () => {
            body.classList.remove('nightowl-root-bg');
            html.classList.remove('nightowl-root-bg');
        };
    }, [activeView]);

    const getTotalCards = () => {
        if (!decks || decks.length === 0) return 0;
        return decks.reduce((sum, deck) => sum + (typeof deck.num_of_cards === 'number' ? deck.num_of_cards : 0), 0);
    };

    // Add this function to fetch due today count
    const fetchDueTodayCount = async () => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            if (!token) return;

            // Fetch all decks
            const decksResponse = await fetch('http://localhost:8000/api/flashcards/deck/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!decksResponse.ok) return;
            const decks = await decksResponse.json();

            // Fetch cards for each deck and count due today
            let dueToday = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const deck of decks) {
                const cardsResponse = await fetch(`http://localhost:8000/api/flashcards/cards/${deck.id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!cardsResponse.ok) continue;
                const cards = await cardsResponse.json();

                cards.forEach(card => {
                    if (card.scheduled_date) {
                        const dueDate = new Date(card.scheduled_date);
                        dueDate.setHours(0, 0, 0, 0);
                        if (dueDate.getTime() === today.getTime()) {
                            dueToday++;
                        }
                    }
                });
            }

            setDueTodayCount(dueToday);
        } catch (error) {
            console.error('Error fetching due today count:', error);
        }
    };

    // Add this useEffect to fetch the count when the component mounts
    useEffect(() => {
        if (activeView === 'flashcards') {
            fetchDueTodayCount();
        }
    }, [activeView]);

    // Add this function to fetch upcoming cards
    const fetchUpcomingCards = async () => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            if (!token) return;

            // Fetch all decks
            const decksResponse = await fetch('http://localhost:8000/api/flashcards/deck/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!decksResponse.ok) return;
            const decks = await decksResponse.json();

            // Fetch cards for each deck and filter for next 7 days
            let upcoming = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            for (const deck of decks) {
                const cardsResponse = await fetch(`http://localhost:8000/api/flashcards/cards/${deck.id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!cardsResponse.ok) continue;
                const cards = await cardsResponse.json();

                cards.forEach(card => {
                    if (card.scheduled_date) {
                        const dueDate = new Date(card.scheduled_date);
                        dueDate.setHours(0, 0, 0, 0);
                        if (dueDate > today && dueDate <= nextWeek) {
                            upcoming.push({
                                ...card,
                                deckTitle: deck.title
                            });
                        }
                    }
                });
            }

            // Sort by scheduled date
            upcoming.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
            setUpcomingCards(upcoming);
        } catch (error) {
            console.error('Error fetching upcoming cards:', error);
        }
    };

    // Add this useEffect to fetch upcoming cards when the component mounts
    useEffect(() => {
        if (activeView === 'flashcards') {
            fetchUpcomingCards();
        }
    }, [activeView]);

    return (
        <div className="dashboard-container" style={{ 
            ...(activeView === 'flashcards' && {
                background: `url(${blackboardBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                margin: 0,
                padding: 0
            })
        }}>
            {/* Notification */}
            {notification.show && (
                <div className="notification" style={{ backgroundColor: notification.type === 'success' ? '#4CAF50' : '#f44336' }}>
                    {notification.message}
                </div>
            )}

            {/* Left Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-top">
                    <div className="workspace-header">
                        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                            <div className="user-avatar">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="user-email">{user?.email}</div>
                                <div className="workspace-name">Personal</div>
                            </div>
                        </div>
                        {showDropdown && (
                            <div className="profile-dropdown">
                                <div className="dropdown-menu">
                                    <button className="dropdown-item">
                                        <FiSettings className="dropdown-icon" />
                                        Settings
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="logout-button" onClick={logout}>
                                        <FiLogOut className="dropdown-icon" />
                                        Log out of NeuroNote
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sidebar-content">
                    <div 
                        className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleSidebarNav('dashboard')}
                    >
                        <FiHome className="nav-icon" />
                        <span>Home</span>
                    </div>
                    <div 
                        className={`nav-item ${activeView === 'flashcards' ? 'active' : ''}`}
                        onClick={() => handleSidebarNav('flashcards')}
                    >
                        <FiBook className="nav-icon" />
                        <span>Flashcards</span>
                    </div>
                    <div className="folders-section">
                        <div className="folders-header">
                            <h3>Folders</h3>
                            <button className="create-folder-btn" onClick={handleCreateFolder}>
                                <FiPlus />
                            </button>
                        </div>
                        <div className="folders-list">
                            {folders.map(folder => (
                                <div key={folder.id}>
                                    <div 
                                        className={`folder-item ${selectedFolder?.id === folder.id && activeView === 'folder' ? 'active' : ''}`}
                                        onClick={(e) => handleFolderClick(folder.id, e)}
                                        onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
                                    >
                                        <button 
                                            className={`folder-expand-btn ${expandedFolders[folder.id] ? 'expanded' : ''}`}
                                            onClick={(e) => toggleFolder(folder.id, e)}
                                        >
                                            &gt;
                                        </button>
                                        <img 
                                            src={expandedFolders[folder.id] ? openFolderIcon : closedFolderIcon} 
                                            alt="folder" 
                                            className="folder-icon"
                                        />
                                        <span className="folder-name" title={folder.name}>{folder.name}</span>
                                        <span className="folder-count">{folder.content_num || 0}</span>
                                    </div>
                                    {expandedFolders[folder.id] && (
                                        <div className={`folder-contents ${expandedFolders[folder.id] ? 'expanded' : ''}`}>
                                            {renderFolderItems(folder)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area Wrapper */}
            <div className="main-area" style={{
                ...(activeView === 'flashcards' && {
                    height: '100vh',
                    overflowY: 'auto',
                    paddingTop: '60px'
                })
            }}>
                {/* Horizontal Navbar */}
                <div className="main-horizontal-navbar">
                    <div className="navbar-left">
                        <button 
                            className={`action-icon-button ${currentNavIndex <= 0 ? 'disabled' : ''}`}
                            onClick={handleBack}
                            disabled={currentNavIndex <= 0}
                        >
                            &lt;
                        </button>
                        <button 
                            className={`action-icon-button ${currentNavIndex >= navHistory.length - 1 ? 'disabled' : ''}`}
                            onClick={handleForward}
                            disabled={currentNavIndex >= navHistory.length - 1}
                        >
                            &gt;
                        </button>
                        <div className="navbar-title">{getCurrentViewTitle()}</div>
                    </div>
                    <div className="dashboard-actions">
                        <button className="action-icon-button" onClick={handleShare}><FiShare2 /></button>
                        <button className="action-icon-button" onClick={handleStar}><FiStar /></button>
                        <div className="settings-container">
                            <button className="action-icon-button" onClick={handleSettingsClick}>
                                <FiMoreVertical />
                            </button>
                            {showSettingsDropdown && (
                                <div className="settings-dropdown show">
                                    {/* ... existing dropdown content ... */}
                                </div>
                            )}
                        </div>
                        <button className="action-icon-button" onClick={handleCollab}><FiUsers /></button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="tabs-content-container">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 