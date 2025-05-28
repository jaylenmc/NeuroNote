import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiHome, FiSettings, FiLogOut, FiFolder, FiPlus, FiBook, FiLayers, FiCheckSquare, FiTrendingUp, FiAward, FiShare2, FiStar, FiMoreVertical, FiUsers, FiFileText, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import closedFolderIcon from '../assets/ClosedFolder.svg';
import openFolderIcon from '../assets/OpenFolder.svg';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import './Dashboard.css';
import QuizView from './QuizView';

function Dashboard() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [folders, setFolders] = useState([]);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
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
                
                // Fetch all decks and quizzes in parallel
                const [allDecks, allQuizzes] = await Promise.all([
                    fetchAllDecks(),
                    fetchAllQuizzes()
                ]);

                if (!isMounted) return;

                // Process folders with their items
                const foldersWithCounts = foldersData.map(folder => {
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
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                // Update the folder's items directly from the folders state
                setFolders(prevFolders => 
                    prevFolders.map(f => {
                        if (f.id === folderId) {
                            return {
                                ...f,
                                items: f.items || []
                            };
                        }
                        return f;
                    })
                );
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
            const existingQuizzes = existingItems.filter(item => item.type === 'quiz');

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

                    // Combine decks and existing quizzes
                    const updatedItems = [...mappedDecks, ...existingQuizzes];

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

    const handleFolderClick = (folderId, e) => {
        // Prevent handling if this is a double click
        if (e.detail > 1) return;
        
        const folder = folders.find(f => f.id === folderId);
        
        // Start transition
        setIsTransitioning(true);
        
        // Clear any existing timeout
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }
        
        // Set new timeout
        const timeout = setTimeout(() => {
            setIsTransitioning(false);
        }, 300); // 300ms transition
        
        setTransitionTimeout(timeout);
        
        // Update the selected folder with all its items
        handleNavigation('folder', folder, null, null);
    };

    // Add useEffect to fetch folder contents when selected folder changes
    useEffect(() => {
        if (selectedFolder && activeView === 'folder') {
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
    const handleNavigation = (view, folder = null, deck = null, quiz = null) => {
        // If we're not at the end of the history, remove future entries
        const newHistory = navHistory.slice(0, currentNavIndex + 1);
        // Add new navigation state
        newHistory.push({ view, folder, deck, quiz });
        setNavHistory(newHistory);
        setCurrentNavIndex(newHistory.length - 1);
        setActiveView(view);
        setSelectedFolder(folder);
        setSelectedDeck(deck);
        setSelectedQuiz(quiz);
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

    const handleCreateQuiz = async () => {
        if (newQuiz.topic.trim() && newQuiz.subject.trim()) {
            try {
                const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}test/quiz/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        topic: newQuiz.topic.trim(),
                        subject: newQuiz.subject.trim(),
                        folder_id: selectedFolder.id
                    })
                });
                
                if (!response) return;

                if (response.ok) {
                    const createdQuiz = await response.json();
                    console.log('Created quiz response:', createdQuiz);
                    
                    // Create the quiz item with all necessary fields
                    const newQuizItem = {
                        id: createdQuiz.id,
                        type: 'quiz',
                        topic: createdQuiz.topic,
                        subject: createdQuiz.subject,
                        folder: createdQuiz.folder
                    };

                    // Update the selected folder
                    setSelectedFolder(prevFolder => {
                        const updatedItems = [...(prevFolder.items || []), newQuizItem];
                        return {
                            ...prevFolder,
                            items: updatedItems,
                            quizCount: (prevFolder.quizCount || 0) + 1
                        };
                    });

                    // Update the folders state
                    setFolders(prevFolders => 
                        prevFolders.map(folder => {
                            if (folder.id === selectedFolder.id) {
                                const updatedItems = [...(folder.items || []), newQuizItem];
                                return {
                                    ...folder,
                                    items: updatedItems,
                                    quizCount: (folder.quizCount || 0) + 1
                                };
                            }
                            return folder;
                        })
                    );

                    // Clear the form and close modal
                    setNewQuiz({ topic: '', subject: '' });
                    setShowNewQuizModal(false);
                    showNotification('Quiz created successfully');
                } else {
                    const errorText = await response.text();
                    console.error('Failed to create quiz:', errorText);
                    showNotification('Failed to create quiz: ' + errorText);
                }
            } catch (error) {
                console.error('Error creating quiz:', error);
                showNotification('Error creating quiz');
            }
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

    return (
        <div className="dashboard-container">
            {/* Notification */}
            {notification.show && (
                <div className="notification">
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
                        <span>Dashboard</span>
                    </div>

                    <div className="folders-section">
                        <div className="folders-header">
                            <h3>Folders</h3>
                            <button 
                                className="create-folder-btn"
                                onClick={() => setShowNewFolderModal(true)}
                            >
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
                                        <span className="folder-count">{folder.deckCount + folder.quizCount || 0}</span>
                                    </div>
                                    {expandedFolders[folder.id] && (
                                        <div className={`folder-contents ${expandedFolders[folder.id] ? 'expanded' : ''}`}>
                                            {folder.items && folder.items.length > 0 ? (
                                                folder.items.map(item => (
                                                    <div 
                                                        key={item.id} 
                                                        className={`folder-content-item ${
                                                            (item.type === 'deck' && selectedDeck?.id === item.id && activeView === 'deck') ||
                                                            (item.type === 'quiz' && selectedQuiz?.id === item.id && activeView === 'quiz')
                                                                ? 'active' 
                                                                : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.type === 'deck') {
                                                                handleDeckClick(item.id, e);
                                                            } else {
                                                                handleQuizClick(item.id, e);
                                                            }
                                                        }}
                                                        onContextMenu={(e) => {
                                                            e.stopPropagation();
                                                            handleContextMenu(e, item.type, item.id);
                                                        }}
                                                    >
                                                        {item.type === 'deck' ? (
                                                            <FiLayers className="content-icon" />
                                                        ) : (
                                                            <FiFileText className="content-icon" />
                                                        )}
                                                        <span className="content-name">{item.type === 'deck' ? item.name : item.topic}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-folder-content">
                                                    <p>No items in this folder</p>
                                                    <div className="empty-folder-actions">
                                                        <button 
                                                            className="add-item-btn"
                                                            onClick={() => setShowNewDeckModal(true)}
                                                        >
                                                            <FiLayers /> Add Deck
                                                        </button>
                                                        <button 
                                                            className="add-item-btn"
                                                            onClick={() => setShowNewQuizModal(true)}
                                                        >
                                                            <FiFileText /> Add Quiz
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area Wrapper */}
            <div className="main-area">
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
                            <button 
                                className="action-icon-button" 
                                onClick={handleSettingsClick}
                            >
                                <FiMoreVertical />
                            </button>
                            {showSettingsDropdown && (
                                <div className="settings-dropdown show">
                                    {activeView === 'folder' && selectedFolder && (
                                        <button 
                                            className="dropdown-item delete-option"
                                            onClick={() => {
                                                handleDeleteFolder(selectedFolder.id);
                                                setShowSettingsDropdown(false);
                                            }}
                                        >
                                            Delete Folder
                                        </button>
                                    )}
                                    {activeView === 'deck' && selectedDeck && (
                                        <button 
                                            className="dropdown-item delete-option"
                                            onClick={() => {
                                                handleDeleteDeck(selectedDeck.id);
                                                setShowSettingsDropdown(false);
                                            }}
                                        >
                                            Delete Deck
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <button className="action-icon-button" onClick={handleCollab}><FiUsers /></button>
                    </div>
                </div>

                {activeView === 'dashboard' && (
                    <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                        {isLoading.initialLoad ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="dashboard-widgets">
                                {/* Review Stats Widget */}
                                <div className="widget review-stats">
                                    <h3>Review Activity</h3>
                                    <div className="graph-container">
                                        <div className="graph">
                                            <div className="graph-bars">
                                                {[65, 80, 45, 90, 70, 85, 60].map((height, index) => (
                                                    <div key={index} className="bar" style={{ height: `${height}%` }}>
                                                        <span className="bar-value">{height}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="graph-labels">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                                                    <span key={index} className="day-label">{day}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stats-summary">
                                        <div className="stat-item">
                                            <span className="stat-value">7</span>
                                            <span className="stat-label">Day Streak</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">85%</span>
                                            <span className="stat-label">Goal Progress</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Review Stats Widget */}
                                <div className="widget detailed-stats">
                                    <h3>Detailed Review Stats</h3>
                                    <div className="time-studied">
                                        <h4>Time Studied This Week</h4>
                                        <div className="time-value">12h 45m</div>
                                    </div>
                                    <div className="cards-reviewed">
                                        <h4>Cards Reviewed</h4>
                                        <div className="cards-value">245</div>
                                    </div>
                                    <div className="needs-work">
                                        <h4>Cards Needing Work</h4>
                                        <ul>
                                            <li>
                                                <span className="subject">Biology</span>
                                                <span className="count">15 cards</span>
                                            </li>
                                            <li>
                                                <span className="subject">Chemistry</span>
                                                <span className="count">8 cards</span>
                                            </li>
                                            <li>
                                                <span className="subject">Physics</span>
                                                <span className="count">12 cards</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Upcoming Reviews Widget */}
                                <div className="widget upcoming-reviews">
                                    <h3>Upcoming Reviews</h3>
                                    <div className="reviews-list">
                                        <div className="review-item high-priority">
                                            <div className="review-info">
                                                <h4>Biology - Cell Structure</h4>
                                                <p>Due in 2 hours</p>
                                            </div>
                                            <div className="priority-badge high">High Priority</div>
                                        </div>
                                        <div className="review-item medium-priority">
                                            <div className="review-info">
                                                <h4>Chemistry - Atomic Theory</h4>
                                                <p>Due in 5 hours</p>
                                            </div>
                                            <div className="priority-badge medium">Medium Priority</div>
                                        </div>
                                        <div className="review-item low-priority">
                                            <div className="review-info">
                                                <h4>Physics - Mechanics</h4>
                                                <p>Due tomorrow</p>
                                            </div>
                                            <div className="priority-badge low">Low Priority</div>
                                        </div>
                                        <div className="review-item high-priority">
                                            <div className="review-info">
                                                <h4>Biology - DNA Replication</h4>
                                                <p>Due in 3 hours</p>
                                            </div>
                                            <div className="priority-badge high">High Priority</div>
                                        </div>
                                        <div className="review-item medium-priority">
                                            <div className="review-info">
                                                <h4>Chemistry - Chemical Bonds</h4>
                                                <p>Due in 6 hours</p>
                                            </div>
                                            <div className="priority-badge medium">Medium Priority</div>
                                        </div>
                                        <div className="review-item low-priority">
                                            <div className="review-info">
                                                <h4>Physics - Thermodynamics</h4>
                                                <p>Due in 2 days</p>
                                            </div>
                                            <div className="priority-badge low">Low Priority</div>
                                        </div>
                                        <div className="review-item high-priority">
                                            <div className="review-info">
                                                <h4>Biology - Photosynthesis</h4>
                                                <p>Due in 4 hours</p>
                                            </div>
                                            <div className="priority-badge high">High Priority</div>
                                        </div>
                                        <div className="review-item medium-priority">
                                            <div className="review-info">
                                                <h4>Chemistry - Periodic Table</h4>
                                                <p>Due in 8 hours</p>
                                            </div>
                                            <div className="priority-badge medium">Medium Priority</div>
                                        </div>
                                        <div className="review-item low-priority">
                                            <div className="review-info">
                                                <h4>Physics - Wave Motion</h4>
                                                <p>Due in 3 days</p>
                                            </div>
                                            <div className="priority-badge low">Low Priority</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'folder' && selectedFolder && (
                    <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                        <div className="folder-content-header">
                            <div className="add-item-buttons">
                                <button 
                                    className="add-item-btn"
                                    onClick={() => setShowNewDeckModal(true)}
                                >
                                    <FiLayers /> Add Deck
                                </button>
                                <button 
                                    className="add-item-btn"
                                    onClick={() => setShowNewQuizModal(true)}
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
                            <div className="folder-items">
                                {selectedFolder && selectedFolder.items && selectedFolder.items.length > 0 ? (
                                    selectedFolder.items.map(item => {
                                        return item.type === 'deck' ? (
                                            <div 
                                                key={item.id} 
                                                className={`deck-item ${selectedDeck?.id === item.id && activeView === 'deck' ? 'active' : ''}`} 
                                                onClick={(e) => handleDeckClick(item.id, e)}
                                                onContextMenu={(e) => handleContextMenu(e, 'deck', item.id)}
                                            >
                                                <FiLayers className="deck-icon white-icon" />
                                                <div className="deck-info">
                                                    <div className="deck-name">{item.name}</div>
                                                    <div className="deck-stats">
                                                        {item.subject} • {cards.filter(card => card.card_deck === item.id).length} cards • Not reviewed yet
                                                    </div>
                                                </div>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDeck(item.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div 
                                                key={item.id} 
                                                className={`deck-item ${selectedQuiz?.id === item.id && activeView === 'quiz' ? 'active' : ''}`}
                                                onClick={(e) => handleQuizClick(item.id, e)}
                                                onContextMenu={(e) => handleContextMenu(e, 'quiz', item.id)}
                                            >
                                                <FiFileText className="deck-icon white-icon" />
                                                <div className="deck-info">
                                                    <div className="deck-name">{item.topic}</div>
                                                    <div className="deck-stats">
                                                        {item.subject} • Quiz
                                                    </div>
                                                </div>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item && item.id) {
                                                            handleDeleteQuiz(item.id);
                                                        } else {
                                                            console.error('Invalid quiz item:', item);
                                                            showNotification('Error: Invalid quiz data');
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-folder-state">
                                        <div className="empty-folder-message">
                                            <h3>This folder is empty</h3>
                                            <p>Add a deck or quiz to get started</p>
                                        </div>
                                        <div className="empty-folder-actions">
                                            <button 
                                                className="add-item-btn"
                                                onClick={() => setShowNewDeckModal(true)}
                                            >
                                                <FiLayers /> Add Deck
                                            </button>
                                            <button 
                                                className="add-item-btn"
                                                onClick={() => setShowNewQuizModal(true)}
                                            >
                                                <FiFileText /> Add Quiz
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'deck' && selectedDeck && (
                    <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                        <div className="deck-content-header">
                            <div className="deck-info-header">
                                <h2>{selectedDeck.name}</h2>
                                <span className="deck-subject">{selectedDeck.subject}</span>
                            </div>
                            <button 
                                className="add-item-btn"
                                onClick={() => setShowNewCardModal(true)}
                            >
                                <FiPlus /> Add Card
                            </button>
                        </div>
                        {isLoading.initialLoad ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="cards-list">
                                {cards.filter(card => card.card_deck === selectedDeck.id).map(card => (
                                    <div key={card.id} className="card-item">
                                        <div className="card-content">
                                            <div className="card-question">{card.question}</div>
                                            <div className="card-answer">{card.answer}</div>
                                            <div className="card-scheduled-date">
                                                Scheduled: {new Date(card.scheduled_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteCard(card.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                {cards.filter(card => card.card_deck === selectedDeck.id).length === 0 && (
                                    <div className="empty-state">
                                        <p>No cards yet. Create your first card to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'quiz' && (
                    <div className={`content-section ${isTransitioning ? 'transitioning' : ''}`}>
                        {selectedQuiz && (
                            <div className={`quiz-view ${isTransitioning ? 'transitioning' : ''}`}>
                                <QuizView 
                                    quiz={selectedQuiz} 
                                    onClose={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            // Find the last valid navigation state
                                            for (let i = navHistory.length - 1; i >= 0; i--) {
                                                const prevState = navHistory[i];
                                                if (prevState.view !== 'quiz') {
                                                    handleNavigation(prevState.view, prevState.folder, prevState.deck);
                                                    break;
                                                }
                                            }
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="modal-overlay show">
                    <div className="modal-content">
                        <h3>Create New Folder</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button 
                                className="create-btn" 
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim()}
                            >
                                Create
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            {showQuizModal && selectedQuiz && (
                <div className="modal-overlay">
                    <div className="modal-content quiz-modal">
                        <div className="quiz-modal-header">
                            <h3>{selectedQuiz.name}</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowQuizModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="quiz-questions">
                            {quizQuestions.map(question => (
                                <div key={question.id} className="quiz-question">
                                    {editingQuestion?.id === question.id ? (
                                        <div className="edit-question">
                                            <input
                                                type="text"
                                                value={question.question}
                                                onChange={(e) => handleSaveQuestion({
                                                    ...question,
                                                    question: e.target.value
                                                })}
                                                className="question-input"
                                            />
                                            <div className="options-list">
                                                {question.options.map((option, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...question.options];
                                                            newOptions[index] = e.target.value;
                                                            handleSaveQuestion({
                                                                ...question,
                                                                options: newOptions
                                                            });
                                                        }}
                                                        className="option-input"
                                                    />
                                                ))}
                                            </div>
                                            <select
                                                value={question.correctAnswer}
                                                onChange={(e) => handleSaveQuestion({
                                                    ...question,
                                                    correctAnswer: e.target.value
                                                })}
                                                className="correct-answer-select"
                                            >
                                                {question.options.map((option, index) => (
                                                    <option key={index} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="question-content">
                                                <p>{question.question}</p>
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEditQuestion(question)}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                            </div>
                                            <div className="options-list">
                                                {question.options.map((option, index) => (
                                                    <div 
                                                        key={index}
                                                        className={`option ${option === question.correctAnswer ? 'correct' : ''}`}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            <button 
                                className="add-question-btn"
                                onClick={handleAddQuestion}
                            >
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Deck Modal */}
            {showNewDeckModal && (
                <div className="modal-overlay show">
                    <div className="modal-content">
                        <h3>Create New Deck</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            placeholder="Enter deck name"
                            autoFocus
                        />
                        <input
                            type="text"
                            className="folder-input"
                            value={newDeckSubject}
                            onChange={(e) => setNewDeckSubject(e.target.value)}
                            placeholder="Enter subject"
                        />
                        <div className="modal-actions">
                            <button 
                                className="create-btn" 
                                onClick={handleCreateDeck}
                                disabled={!newDeckName.trim() || !newDeckSubject.trim()}
                            >
                                Create
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowNewDeckModal(false);
                                    setNewDeckName('');
                                    setNewDeckSubject('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Card Modal */}
            {showNewCardModal && (
                <div className="modal-overlay show">
                    <div className="modal-content">
                        <h3>Create New Card</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newCard.question}
                            onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                            placeholder="Enter question"
                            autoFocus
                        />
                        <input
                            type="text"
                            className="folder-input"
                            value={newCard.answer}
                            onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                            placeholder="Enter answer"
                        />
                        <input
                            type="date"
                            className="folder-input"
                            value={newCard.scheduled_date}
                            onChange={(e) => setNewCard({ ...newCard, scheduled_date: e.target.value })}
                        />
                        <div className="modal-actions">
                            <button 
                                className="create-btn" 
                                onClick={handleCreateCard}
                                disabled={!newCard.question.trim() || !newCard.answer.trim()}
                            >
                                Create
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowNewCardModal(false);
                                    setNewCard({ question: '', answer: '', scheduled_date: '' });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Quiz Modal */}
            {showNewQuizModal && (
                <div className="modal-overlay show">
                    <div className="modal-content">
                        <h3>Create New Quiz</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newQuiz.topic}
                            onChange={(e) => setNewQuiz({ ...newQuiz, topic: e.target.value })}
                            placeholder="Enter quiz topic"
                            autoFocus
                        />
                        <input
                            type="text"
                            className="folder-input"
                            value={newQuiz.subject}
                            onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                            placeholder="Enter subject"
                        />
                        <div className="modal-actions">
                            <button 
                                className="create-btn" 
                                onClick={handleCreateQuiz}
                                disabled={!newQuiz.topic.trim() || !newQuiz.subject.trim()}
                            >
                                Create
                            </button>
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowNewQuizModal(false);
                                    setNewQuiz({ topic: '', subject: '' });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Question Modal */}
            {showNewQuestionModal && (
                <div className="modal-overlay show">
                    <div className="modal-content question-modal">
                        <h3>Create New Question</h3>
                        <div className="question-form">
                            {/* Question Input */}
                            <div className="form-group">
                                <label>Question</label>
                                <textarea
                                    value={newQuestion.question_input}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question_input: e.target.value }))}
                                    placeholder="Enter your question"
                                    rows={3}
                                    className="question-input"
                                />
                            </div>

                            {/* Question Type Selection */}
                            <div className="form-group">
                                <label>Question Type</label>
                                <div className="question-type-options">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="MC"
                                            checked={newQuestion.question_type === 'MC'}
                                            onChange={(e) => {
                                                setNewQuestion(prev => ({
                                                    ...prev,
                                                    question_type: e.target.value,
                                                    answers: e.target.value === 'MC' ? 
                                                        [{ answer_input: '', is_correct: false }] : 
                                                        [{ answer_input: '', is_correct: true }]
                                                }));
                                            }}
                                        />
                                        <span>Multiple Choice</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="WR"
                                            checked={newQuestion.question_type === 'WR'}
                                            onChange={(e) => {
                                                setNewQuestion(prev => ({
                                                    ...prev,
                                                    question_type: e.target.value,
                                                    answers: [{ answer_input: '', is_correct: true }]
                                                }));
                                            }}
                                        />
                                        <span>Written</span>
                                    </label>
                                </div>
                            </div>

                            {/* Answers Section */}
                            <div className="answers-section">
                                <label>Answers</label>
                                {newQuestion.question_type === 'MC' ? (
                                    // Multiple Choice Answers
                                    <div className="mc-answers">
                                        {newQuestion.answers.map((answer, index) => (
                                            <div key={index} className="answer-row">
                                                <input
                                                    type="radio"
                                                    name="correct-answer"
                                                    checked={answer.is_correct}
                                                    onChange={() => {
                                                        setNewQuestion(prev => ({
                                                            ...prev,
                                                            answers: prev.answers.map((a, i) => ({
                                                                ...a,
                                                                is_correct: i === index
                                                            }))
                                                        }));
                                                    }}
                                                    className="correct-answer-radio"
                                                />
                                                <input
                                                    type="text"
                                                    value={answer.answer_input}
                                                    onChange={(e) => handleAnswerChange(index, 'answer_input', e.target.value)}
                                                    placeholder={`Answer ${index + 1}`}
                                                    className="answer-input"
                                                />
                                                {newQuestion.answers.length > 1 && (
                                                    <button
                                                        className="remove-answer-btn"
                                                        onClick={() => handleRemoveAnswer(index)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            className="add-answer-btn"
                                            onClick={handleAddAnswer}
                                        >
                                            + Add Answer
                                        </button>
                                    </div>
                                ) : (
                                    // Written Answer
                                    <div className="written-answer">
                                        <textarea
                                            value={newQuestion.answers[0].answer_input}
                                            onChange={(e) => handleAnswerChange(0, 'answer_input', e.target.value)}
                                            placeholder="Enter the correct answer"
                                            rows={3}
                                            className="answer-input"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button 
                                    className="create-btn" 
                                    onClick={handleCreateQuestion}
                                >
                                    Create Question
                                </button>
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => setShowNewQuestionModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu.show && (
                <div 
                    className="context-menu"
                    style={{ 
                        top: contextMenu.y, 
                        left: contextMenu.x 
                    }}
                >
                    <button 
                        className="context-menu-item delete-option"
                        onClick={() => {
                            if (contextMenu.type === 'folder') {
                                handleDeleteFolder(contextMenu.id);
                            } else if (contextMenu.type === 'deck') {
                                handleDeleteDeck(contextMenu.id);
                            } else if (contextMenu.type === 'quiz') {
                                handleDeleteQuiz(contextMenu.id);
                            }
                            setContextMenu({ show: false, x: 0, y: 0, type: null, id: null });
                        }}
                    >
                        Delete {contextMenu.type === 'folder' ? 'Folder' : contextMenu.type === 'deck' ? 'Deck' : 'Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Dashboard; 