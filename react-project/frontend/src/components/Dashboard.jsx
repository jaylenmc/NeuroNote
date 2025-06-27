import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiHome, FiSettings, FiLogOut, FiFolder, FiPlus, FiBook, FiLayers, FiCheckSquare, FiTrendingUp, FiAward, FiShare2, FiStar, FiMoreVertical, FiUsers, FiFileText, FiEdit2, FiArrowLeft, FiChevronRight, FiSearch, FiGrid, FiList, FiUpload, FiClock, FiGlobe, FiTag, FiSave } from 'react-icons/fi';
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
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import './DashboardHome.css';

function Dashboard({ initialView }) {
    const navigate = useNavigate(); // <-- Move here, top level
    const location = useLocation();
    const { user, logout, login } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [folders, setFolders] = useState([]);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [activeView, setActiveView] = useState(initialView || 'dashboard');
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
    const [showNewItemDropdown, setShowNewItemDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const [isNotesMode, setIsNotesMode] = useState(false);
    const [noteTitle, setNoteTitle] = useState('Untitled Note');
    const [noteContent, setNoteContent] = useState('');
    const [noteTags, setNoteTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [blocks, setBlocks] = useState([
        { id: '1', type: 'paragraph', content: '', checked: false }
    ]);
    const [activeBlockId, setActiveBlockId] = useState('1');
    const [showBlockMenu, setShowBlockMenu] = useState({ blockId: null, x: 0, y: 0 });
    const [hoveredBlockId, setHoveredBlockId] = useState(null);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
    const [editingBlocks, setEditingBlocks] = useState(new Set()); // Track which blocks are being edited

    // Add a ref map for block textareas
    const blockRefs = useRef({});
    const [justAddedBlockId, setJustAddedBlockId] = useState(null);

    const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, Math.max(level - 1, 0)));
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const nextLevelXp = xpForLevel(level);
    const progress = Math.max(0, Math.min((xp / nextLevelXp) * 100, 100));

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
                // If foldersData contains xp and level, update user
                if (foldersData.xp !== undefined && foldersData.level !== undefined) {
                    login({ ...user, xp: foldersData.xp, level: foldersData.level });
                }
                // foldersData.folders is the actual folders array
                const foldersWithCounts = (foldersData.folders || foldersData).map(folder => {
                    return {
                        ...folder,
                        documentCount: folder.content_num || 0,
                        deckCount: 0,
                        quizCount: 0,
                        // Ensure sub_folders is properly handled
                        sub_folders: folder.sub_folders || []
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

    const handleCreateFolder = async (name = newFolderName, parentId = null) => {
        if (name.trim()) {
            try {
                const token = sessionStorage.getItem('jwt_token');
                const body = parentId
                    ? JSON.stringify({ name: name.trim(), folder_id: parentId })
                    : JSON.stringify({ name: name.trim() });
                const response = await fetch(`${import.meta.env.VITE_API_URL}folders/user/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body
                });
                
                if (response.ok) {
                    const newFolderData = await response.json();
                    // Handle both regular folders and subfolders
                    if (newFolderData.folder) {
                        // Regular folder created
                        setFolders(prev => [...prev, newFolderData.folder]);
                        setNewFolderName('');
                        setShowNewFolderModal(false);
                    } else if (newFolderData.sub_folder) {
                        // Subfolder created, refresh folders to get updated structure
                        fetchFolders();
                        setShowNewSubfolderModal(false);
                        setNewSubfolderName('');
                        setSubfolderParentId(null);
                    }
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
        
        const folder = folders.find(f => f.id === folderId) ||
                       folders.flatMap(f => f.sub_folders || []).find(sf => sf.id === folderId);
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
                return prevFolders.map(f => {
                    if (f.id === folderId) {
                        return updatedFolder;
                    }
                    if (f.sub_folders) {
                        return {
                            ...f,
                            sub_folders: f.sub_folders.map(sf => sf.id === folderId ? updatedFolder : sf)
                        };
                    }
                    return f;
                });
            });
            // After updating folders, also update selectedFolder to the updatedFolder (for both folders and subfolders)
            setSelectedFolder(updatedFolder);
            setActiveView('folder');
        
        // Set new timeout
        const timeout = setTimeout(() => {
            setIsTransitioning(false);
        }, 300); // 300ms transition
        
        setTransitionTimeout(timeout);
        
            // Update the selected folder and view
            console.log('Setting selected folder to:', updatedFolder);
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
        if (!e.target.closest('.new-item-container')) {
            setShowNewItemDropdown(false);
        }
        if (!e.target.closest('.block-type-menu') && !e.target.closest('.block-menu-button')) {
            handleBlockMenuClose();
        }
    };

    // Add useEffect to handle block menu clicks outside
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

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
        try {
            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}documents/notes/${selectedFolder.id}/`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title: 'Untitled Document',
                        content: ''
                    })
                }
            );
            
            if (!response) return;

            if (response.ok) {
                const newDocument = await response.json();
                
                // Update the folder's items
                setSelectedFolder(prevFolder => ({
                    ...prevFolder,
                    items: [...(prevFolder.items || []), {
                        id: newDocument.id,
                        type: 'document',
                        title: newDocument.title,
                        updated_at: newDocument.updated_at
                    }]
                }));

                // Update folders state
                setFolders(prevFolders => 
                    prevFolders.map(folder => {
                        if (folder.id === selectedFolder.id) {
                            return {
                                ...folder,
                                items: [...(folder.items || []), {
                                    id: newDocument.id,
                                    type: 'document',
                                    title: newDocument.title,
                                    updated_at: newDocument.updated_at
                                }]
                            };
                        }
                        return folder;
                    })
                );

                showNotification('Document created successfully');
            } else {
                console.error('Failed to create document:', await response.text());
            }
        } catch (error) {
            console.error('Error creating document:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);

            const response = await makeAuthenticatedRequest(
                `${import.meta.env.VITE_API_URL}documents/upload/${selectedFolder.id}/`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        // Don't set Content-Type for FormData, let the browser set it
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}`,
                    }
                }
            );
            
            if (!response) return;

            if (response.ok) {
                const uploadedDocument = await response.json();
                
                // Update the folder's items
                setSelectedFolder(prevFolder => ({
                    ...prevFolder,
                    items: [...(prevFolder.items || []), {
                        id: uploadedDocument.id,
                        type: 'document',
                        title: uploadedDocument.title,
                        updated_at: uploadedDocument.updated_at
                    }]
                }));

                // Update folders state
                setFolders(prevFolders => 
                    prevFolders.map(folder => {
                        if (folder.id === selectedFolder.id) {
                            return {
                                ...folder,
                                items: [...(folder.items || []), {
                                    id: uploadedDocument.id,
                                    type: 'document',
                                    title: uploadedDocument.title,
                                    updated_at: uploadedDocument.updated_at
                                }]
                            };
                        }
                        return folder;
                    })
                );

                showNotification('Document uploaded successfully');
            } else {
                console.error('Failed to upload document:', await response.text());
            }
        } catch (error) {
            console.error('Error uploading document:', error);
        }

        // Reset the file input
        e.target.value = '';
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
        // Render subfolders at the top of the content area
        const subfolders = folder.sub_folders || [];
        const items = folder.items || [];
        return (
            <>
                {subfolders.length > 0 && subfolders.map(subfolder => (
                    <div
                        key={subfolder.id}
                        className={`folder-content-item`}
                        onClick={(e) => { handleFolderClick(subfolder.id, e); }}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={closedFolderIcon}
                            alt="subfolder"
                            className="content-icon"
                            style={{ width: '1.5rem', height: '1.5rem', marginBottom: 0, marginRight: 10 }}
                        />
                        <span className="content-name" title={subfolder.name}>{subfolder.name.length > 18 ? subfolder.name.slice(0, 15) + '...' : subfolder.name}</span>
                    </div>
                ))}
                {items.length === 0 && subfolders.length === 0 && (
                    <div className="empty-folder-content">
                        <p>No items in this folder</p>
                    </div>
                )}
                {items.map(item => {
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
                    }
                    if (item.type === 'quiz') {
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
                })}
            </>
        );
    };

    // Add useEffect to monitor state changes
    useEffect(() => {
        console.log('Selected folder changed:', selectedFolder);
    }, [selectedFolder]);

    useEffect(() => {
        console.log('Folders state changed:', folders);
    }, [folders]);

    const renderContent = () => {
        if (activeView === 'dashboard') {
            return <DashboardHome />;
        }

        if (activeView === 'folder' && selectedFolder) {
            const items = [
                ...(selectedFolder.documents || []),
                ...(selectedFolder.decks || []),
                ...(selectedFolder.quizzes || []),
            ];

            // Show notes editor if in notes mode
            if (isNotesMode) {
                return (
                    <div className="notes-page">
                        {/* Header */}
                        <div className="notes-header">
                            <div className="notes-header-left">
                                <button className="back-button" onClick={handleExitNotesMode}>
                                    <FiArrowLeft />
                                    <span>Back</span>
                                </button>
                            </div>
                            
                            <div className="notes-header-right">
                                {lastSaved && (
                                    <div className="save-status">
                                        <FiClock />
                                        <span>Last saved {formatLastSaved()}</span>
                                    </div>
                                )}
                                
                                <button 
                                    className={`save-button ${isSaving ? 'saving' : ''}`}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <FiSave />
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                                
                                <button 
                                    className={`publish-button ${isPublished ? 'published' : ''}`}
                                    onClick={handlePublish}
                                    disabled={isSaving}
                                >
                                    <FiGlobe />
                                    <span>{isPublished ? 'Published' : 'Publish'}</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="notes-container">
                            {/* Title Input */}
                            <div className="title-section">
                                <input
                                    type="text"
                                    className="title-input"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Untitled Note"
                                />
                            </div>
                            
                            {/* Tags Section */}
                            <div className="tags-section">
                                <div className="tags-container">
                                    {noteTags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            <FiTag />
                                            {tag}
                                            <button 
                                                className="tag-remove"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                
                                <form onSubmit={handleAddTag} className="tag-form">
                                    <input
                                        type="text"
                                        className="tag-input"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag..."
                                    />
                                    <button type="submit" className="tag-add-btn">
                                        Add
                                    </button>
                                </form>
                            </div>
                            
                            {/* Main Editor */}
                            <div className="editor-section">
                                <div className="blocks-container">
                                    {blocks.map((block, index) => {
                                        const prevBlock = blocks[index - 1];
                                        let paragraphStyle = {};
                                        let paragraphClass = 'block-input paragraph';
                                        if (block.type === 'paragraph' && prevBlock && ['h1', 'h2', 'h3'].includes(prevBlock.type)) {
                                            paragraphStyle.marginTop = 0;
                                            paragraphClass += ' paragraph-after-heading';
                                        }
                                        // Placeholder text for each block type
                                        const placeholders = {
                                            paragraph: "Text",
                                            h1: 'Heading 1',
                                            h2: 'Heading 2',
                                            h3: 'Heading 3',
                                            checklist: 'Checklist item...',
                                            quote: 'Quote...',
                                            code: 'Code...'
                                        };
                                        // Handler for Enter key to create new block
                                        function handleBlockKeyDown(e, blockId, type) {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                createNewBlock(blockId, 'paragraph');
                                            }
                                        }
                                        // Helper: show placeholder if block is completely empty
                                        const isFocused = activeBlockId === block.id;
                                        const liveContent = isFocused ? editingContent : block.content;
                                        const isEmpty = !liveContent || liveContent.replace(/<[^>]+>/g, '').trim() === '';
                                        const showPlaceholder = isEmpty;

                                        // On focus, if block is empty, select all content so first keystroke replaces placeholder
                                        function handleBlockFocus(e, blockId) {
                                            setActiveBlockId(blockId);
                                            const el = e.currentTarget;
                                            if (!el.innerText.trim()) {
                                                // Select all content (the placeholder span)
                                                const range = document.createRange();
                                                range.selectNodeContents(el);
                                                const sel = window.getSelection();
                                                sel.removeAllRanges();
                                                sel.addRange(range);
                                            }
                                        }
                                        return (
                                            <div
                                                key={block.id}
                                                className={`block-wrapper ${activeBlockId === block.id ? 'active' : ''}`}
                                                onMouseEnter={() => setHoveredBlockId(block.id)}
                                                onMouseLeave={() => setHoveredBlockId(null)}
                                            >
                                                {/* Block Menu Button */}
                                                {(hoveredBlockId === block.id || activeBlockId === block.id) && (
                                                    <button
                                                        className="block-menu-button"
                                                        onClick={(e) => handleBlockMenuClick(e, block.id)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        +
                                                    </button>
                                                )}
                                                
                                                {/* Block Content */}
                                                <div className="block-content" style={{position: 'relative'}}>
                                                    {showPlaceholder && (
                                                        <span
                                                          className={`block-placeholder ${block.type}`}
                                                          style={
                                                            block.type === 'h1'
                                                              ? { fontSize: '32px', lineHeight: '1.2', fontWeight: 700, color: '#F5F5F5' }
                                                              : block.type === 'h2'
                                                              ? { fontSize: '24px', lineHeight: '1.3', fontWeight: 600, color: '#F5F5F5' }
                                                              : block.type === 'h3'
                                                              ? { fontSize: '20px', lineHeight: '1.4', fontWeight: 600, color: '#F5F5F5' }
                                                              : block.type === 'paragraph'
                                                              ? { fontSize: '16px', lineHeight: '1.5' }
                                                              : {}
                                                          }
                                                        >
                                                          {placeholders[block.type]}
                                                        </span>
                                                    )}
                                                    {block.type === 'paragraph' && (
                                                        <div
                                                            className={paragraphClass}
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Text"
                                                            style={{...paragraphStyle, background: 'transparent', position: 'relative'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {block.type === 'h1' && (
                                                        <div
                                                            className="block-input heading-1"
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Heading 1"
                                                            style={{background: 'transparent'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {block.type === 'h2' && (
                                                        <div
                                                            className="block-input heading-2"
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Heading 2"
                                                            style={{background: 'transparent'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {block.type === 'h3' && (
                                                        <div
                                                            className="block-input heading-3"
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Heading 3"
                                                            style={{background: 'transparent'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {block.type === 'checklist' && (
                                                        <div className="checklist-block">
                                                            <button
                                                                className="checkbox"
                                                                onClick={() => toggleChecklistItem(block.id)}
                                                            >
                                                                {block.checked ? '☑' : '☐'}
                                                            </button>
                                                            <div
                                                                className="block-input checklist"
                                                                contentEditable
                                                                suppressContentEditableWarning
                                                                spellCheck={true}
                                                                data-block-id={block.id}
                                                                data-placeholder="Checklist item..."
                                                                style={{background: 'transparent', position: 'relative'}}
                                                                ref={el => blockRefs.current[block.id] = el}
                                                                onFocus={e => {
                                                                    handleBlockFocus(e, block.id);
                                                                    setEditingBlockId(block.id);
                                                                    setEditingContent(e.currentTarget.innerHTML);
                                                                }}
                                                                onInput={e => {
                                                                    let html = e.currentTarget.innerHTML;
                                                                    if (html === '<br>' || html.trim() === '') {
                                                                        html = '';
                                                                    }
                                                                    setEditingContent(html);
                                                                    if (e.currentTarget.innerText.length > 0) {
                                                                        setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                    } else {
                                                                        setEditingBlocks(prev => {
                                                                            const newSet = new Set(prev);
                                                                            newSet.delete(block.id);
                                                                            return newSet;
                                                                        });
                                                                    }
                                                                }}
                                                                onBlur={e => {
                                                                    let html = e.currentTarget.innerHTML;
                                                                    if (html === '<br>' || html.trim() === '') {
                                                                        html = '';
                                                                    }
                                                                    updateBlockContent(block.id, html);
                                                                    setEditingBlockId(null);
                                                                    setEditingContent('');
                                                                }}
                                                                onMouseUp={e => handleSelection(e, block.id)}
                                                                onKeyUp={e => handleSelection(e, block.id)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                        e.preventDefault();
                                                                        if (blocks.length > 1) {
                                                                            const idx = blocks.findIndex(b => b.id === block.id);
                                                                            if (idx > 0) {
                                                                                const prevBlockId = blocks[idx - 1].id;
                                                                                deleteBlock(block.id);
                                                                                setTimeout(() => {
                                                                                    const prevEl = blockRefs.current[prevBlockId];
                                                                                    if (prevEl) {
                                                                                        prevEl.focus();
                                                                                    }
                                                                                }, 0);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        handleBlockKeyDown(e, block.id, block.type);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {block.type === 'divider' && (
                                                        <div className="divider-block">
                                                            <hr />
                                                        </div>
                                                    )}
                                                    
                                                    {block.type === 'quote' && (
                                                        <div
                                                            className="block-input quote"
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Quote..."
                                                            style={{background: 'transparent', position: 'relative'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {block.type === 'code' && (
                                                        <div
                                                            className="block-input code"
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            spellCheck={true}
                                                            data-block-id={block.id}
                                                            data-placeholder="Code..."
                                                            style={{background: 'transparent', position: 'relative'}}
                                                            ref={el => blockRefs.current[block.id] = el}
                                                            onFocus={e => {
                                                                handleBlockFocus(e, block.id);
                                                                setEditingBlockId(block.id);
                                                                setEditingContent(e.currentTarget.innerHTML);
                                                            }}
                                                            onInput={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                setEditingContent(html);
                                                                if (e.currentTarget.innerText.length > 0) {
                                                                    setEditingBlocks(prev => new Set(prev).add(block.id));
                                                                } else {
                                                                    setEditingBlocks(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.delete(block.id);
                                                                        return newSet;
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                let html = e.currentTarget.innerHTML;
                                                                if (html === '<br>' || html.trim() === '') {
                                                                    html = '';
                                                                }
                                                                updateBlockContent(block.id, html);
                                                                setEditingBlockId(null);
                                                                setEditingContent('');
                                                            }}
                                                            onMouseUp={e => handleSelection(e, block.id)}
                                                            onKeyUp={e => handleSelection(e, block.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && e.currentTarget.innerText.length === 0) {
                                                                    e.preventDefault();
                                                                    if (blocks.length > 1) {
                                                                        const idx = blocks.findIndex(b => b.id === block.id);
                                                                        if (idx > 0) {
                                                                            const prevBlockId = blocks[idx - 1].id;
                                                                            deleteBlock(block.id);
                                                                            setTimeout(() => {
                                                                                const prevEl = blockRefs.current[prevBlockId];
                                                                                if (prevEl) {
                                                                                    prevEl.focus();
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                    }
                                                                } else {
                                                                    handleBlockKeyDown(e, block.id, block.type);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* Plus button under the last block */}
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                                        <button
                                            className="add-block-btn"
                                            onClick={() => createNewBlock(blocks[blocks.length - 1]?.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#A59BFF',
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s',
                                            }}
                                            title="Add new block"
                                            tabIndex={0}
                                            aria-label="Add new block"
                                            onMouseOver={e => e.currentTarget.style.background = '#232323'}
                                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Block Type Menu */}
                                {showBlockMenu.blockId && (
                                    <div
                                        className="block-type-menu"
                                        ref={blockMenuRef}
                                        style={{
                                            position: 'fixed',
                                            left: showBlockMenu.x,
                                            top: blockMenuTop !== null ? blockMenuTop : showBlockMenu.y,
                                            zIndex: 1000
                                        }}
                                    >
                                        {blockTypes.map((blockType, index) => (
                                            <button
                                                key={blockType.type}
                                                className={`block-type-option ${selectedMenuIndex === index ? 'selected' : ''}`}
                                                onClick={() => updateBlockType(showBlockMenu.blockId, blockType.type)}
                                                onMouseEnter={() => setSelectedMenuIndex(index)}
                                            >
                                                <span className="block-type-icon">{blockType.icon}</span>
                                                <span className="block-type-label">{blockType.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="folder-view-container">
                    <div className="folder-view-header">
                        <h1><span className="folder-view-icon">📁</span> {selectedFolder.name}</h1>
                        <p>{(selectedFolder.items?.length || 0) + (selectedFolder.sub_folders?.length || 0)} items</p>
                    </div>

                    <div className="folder-view-actions">
                        <div className="folder-view-search-bar">
                            <FiSearch />
                            <input type="text" placeholder="Search in this folder..." />
                        </div>
                        <div className="new-item-container">
                            <button 
                                className="folder-view-new-btn"
                                onClick={() => setShowNewItemDropdown(!showNewItemDropdown)}
                            >
                                <FiPlus /> New
                            </button>
                            {showNewItemDropdown && (
                                <div className="new-item-dropdown">
                                    <button onClick={() => {
                                        setShowNewItemDropdown(false);
                                        setIsNotesMode(true);
                                    }}>
                                        <FiFileText /> Create Notes
                                    </button>
                                    <button onClick={() => {
                                        setShowNewItemDropdown(false);
                                        fileInputRef.current?.click();
                                    }}>
                                        <FiUpload /> Upload Document
                                    </button>
                                    <button onClick={() => {
                                        setShowNewItemDropdown(false);
                                        setSubfolderParentId(selectedFolder.id);
                                        setShowNewSubfolderModal(true);
                                    }}>
                                        <FiFolder /> Create Subfolder
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                        </div>
                    </div>

                    <div className="folder-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1.5rem' }}>
                        {renderFolderItems(selectedFolder)}
                    </div>
                </div>
            );
        }
        
        if (activeView === 'deck' && selectedDeck) {
            return (
                <div className="deck-view-container">
                    <div className="deck-view-header">
                        <button onClick={handleBack} className="deck-view-back-btn">
                            <FiArrowLeft /> Back to Folder
                        </button>
                        <h1><span className="deck-view-icon">📚</span> {selectedDeck.name}</h1>
                        <p>{cards.length} cards</p>
                    </div>

                    <div className="deck-view-grid">
                        {cards.map(card => (
                            <div key={card.id} className="card-item">
                                <h3 className="card-title">{card.question}</h3>
                                <p className="card-info">
                                    {card.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
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
                        <div className="nightowl-xp-fill" style={{width: `${progress}%`}}></div>
                            </div>
                      <span className="nightowl-xp-label">{xp} / {nextLevelXp} XP</span>
                      <span className="nightowl-xp-label">Level {level}</span>
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
        }
    };

    useEffect(() => {
        // Fetch decks and update AuthContext user with latest XP/level
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
                    if (data.xp !== undefined && data.level !== undefined) {
                        login({ ...user, xp: data.xp, level: data.level });
                    }
                    setDecks(data.decks || data);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch decks:', errorText);
                }
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        };

        fetchDecks();
    }, [activeView, showNewCardModal, showNewDeckModal, showQuizModal]);

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
            const decksData = await decksResponse.json();
            const decks = Array.isArray(decksData.decks) ? decksData.decks : [];

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
            const decksData = await decksResponse.json();
            const decks = Array.isArray(decksData.decks) ? decksData.decks : [];

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

    // Notes-related functions
    const handleSave = async () => {
        if (!user) return;
        
        setIsSaving(true);
        try {
            // Simulate API call for saving
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setLastSaved(new Date());
            setIsSaving(false);
        } catch (error) {
            console.error('Error saving note:', error);
            setIsSaving(false);
        }
    };
    
    const handlePublish = async () => {
        if (!user) return;
        
        setIsSaving(true);
        try {
            // Simulate API call for publishing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsPublished(true);
            setLastSaved(new Date());
            setIsSaving(false);
        } catch (error) {
            console.error('Error publishing note:', error);
            setIsSaving(false);
        }
    };
    
    const handleAddTag = (e) => {
        e.preventDefault();
        if (newTag.trim() && !noteTags.includes(newTag.trim())) {
            setNoteTags([...noteTags, newTag.trim()]);
            setNewTag('');
        }
    };
    
    const handleRemoveTag = (tagToRemove) => {
        setNoteTags(noteTags.filter(tag => tag !== tagToRemove));
    };
    
    const formatLastSaved = () => {
        if (!lastSaved) return null;
        
        const now = new Date();
        const diffMs = now - lastSaved;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 minute ago';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    };

    const handleExitNotesMode = () => {
        setIsNotesMode(false);
        setNoteTitle('Untitled Note');
        setNoteContent('');
        setNoteTags([]);
        setNewTag('');
        setLastSaved(null);
        setIsSaving(false);
        setIsPublished(false);
        setBlocks([{ id: '1', type: 'paragraph', content: '', checked: false }]);
        setActiveBlockId('1');
        setShowBlockMenu({ blockId: null, x: 0, y: 0 });
        setHoveredBlockId(null);
    };

    // Block management functions
    const createNewBlock = (afterId, type = 'paragraph') => {
        const newId = Date.now().toString();
        const newBlock = { id: newId, type, content: '', checked: false };
        
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(block => block.id === afterId);
            const newBlocks = [...prevBlocks];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });
        
        setActiveBlockId(newId);
        setJustAddedBlockId(newId);
        return newId;
    };

    const updateBlockContent = (blockId, content) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId ? { ...block, content } : block
            )
        );
        
        // Auto-resize textarea
        setTimeout(() => {
            const textarea = document.querySelector(`[data-block-id="${blockId}"]`);
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        }, 0);
    };

    const updateBlockType = (blockId, newType) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId ? { ...block, type: newType } : block
            )
        );
        setShowBlockMenu({ blockId: null, x: 0, y: 0 });
    };

    const toggleChecklistItem = (blockId) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId ? { ...block, checked: !block.checked } : block
            )
        );
    };

    const deleteBlock = (blockId) => {
        if (blocks.length === 1) return; // Don't delete the last block
        
        setBlocks(prevBlocks => {
            const newBlocks = prevBlocks.filter(block => block.id !== blockId);
            if (activeBlockId === blockId) {
                const index = prevBlocks.findIndex(block => block.id === blockId);
                const newActiveId = newBlocks[index]?.id || newBlocks[index - 1]?.id || newBlocks[0]?.id;
                setActiveBlockId(newActiveId);
            }
            return newBlocks;
        });
    };

    const handleBlockKeyDown = (e, blockId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createNewBlock(blockId);
        } else if (e.key === 'Backspace' && blocks.find(b => b.id === blockId)?.content === '') {
            e.preventDefault();
            deleteBlock(blockId);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Handle indentation here if needed
        }
    };

    const handleBlockMenuClick = (e, blockId) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setShowBlockMenu({
            blockId,
            x: rect.right + 10,
            y: rect.top
        });
    };

    const handleBlockMenuClose = () => {
        setShowBlockMenu({ blockId: null, x: 0, y: 0 });
        setSelectedMenuIndex(0);
    };

    const handleBlockMenuKeyDown = (e) => {
        if (!showBlockMenu.blockId) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedMenuIndex(prev => 
                    prev < blockTypes.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedMenuIndex(prev => 
                    prev > 0 ? prev - 1 : blockTypes.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (blockTypes[selectedMenuIndex]) {
                    updateBlockType(showBlockMenu.blockId, blockTypes[selectedMenuIndex].type);
                }
                break;
            case 'Escape':
                e.preventDefault();
                handleBlockMenuClose();
                break;
        }
    };

    // Add keyboard event listener for block menu
    useEffect(() => {
        if (showBlockMenu.blockId) {
            document.addEventListener('keydown', handleBlockMenuKeyDown);
            return () => {
                document.removeEventListener('keydown', handleBlockMenuKeyDown);
            };
        }
    }, [showBlockMenu.blockId, selectedMenuIndex]);

    const blockTypes = [
        { type: 'paragraph', label: 'Text', icon: '📝' },
        { type: 'h1', label: 'Heading 1', icon: '📋' },
        { type: 'h2', label: 'Heading 2', icon: '📄' },
        { type: 'h3', label: 'Heading 3', icon: '📑' },
        { type: 'checklist', label: 'Checklist', icon: '☑️' },
        { type: 'divider', label: 'Divider', icon: '➖' },
        { type: 'quote', label: 'Quote', icon: '💬' },
        { type: 'code', label: 'Code', icon: '💻' }
    ];

    // Auto-resize effect for all blocks on mount and when blocks/content change
    useEffect(() => {
        blocks.forEach(block => {
            const ref = blockRefs.current[block.id];
            if (ref) {
                ref.style.height = 'auto';
                ref.style.height = ref.scrollHeight + 'px';
            }
        });
    }, [blocks]);

    const [blockMenuTop, setBlockMenuTop] = useState(null);
    const blockMenuRef = useRef(null);

    useEffect(() => {
        if (showBlockMenu.blockId && blockMenuRef.current) {
            // Calculate menu position only once after mount
            const menuRect = blockMenuRef.current.getBoundingClientRect();
            const overflow = menuRect.bottom - window.innerHeight;
            if (overflow > 0) {
                setBlockMenuTop(showBlockMenu.y - overflow - 8);
            } else {
                setBlockMenuTop(showBlockMenu.y);
            }
        } else {
            setBlockMenuTop(null);
        }
    }, [showBlockMenu]);

    const [formatBar, setFormatBar] = useState({ show: false, x: 0, y: 0 });
    const [formatBlockId, setFormatBlockId] = useState(null);
    const formatBarRef = useRef(null);

    // Handler to show formatting bar on text selection
    function handleSelection(e, blockId) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setFormatBar({
                show: true,
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY - 40 // 40px above selection
            });
            setFormatBlockId(blockId);
        } else {
            setFormatBar({ show: false, x: 0, y: 0 });
            setFormatBlockId(null);
        }
    }

    // Hide format bar on click outside
    useEffect(() => {
        function handleClick(e) {
            if (formatBarRef.current && !formatBarRef.current.contains(e.target)) {
                setFormatBar({ show: false, x: 0, y: 0 });
                setFormatBlockId(null);
            }
        }
        if (formatBar.show) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [formatBar.show]);

    // Formatting functions
    function formatSelection(cmd, value = null) {
        document.execCommand(cmd, false, value);
        setFormatBar({ show: false, x: 0, y: 0 });
        setFormatBlockId(null);
    }

    // Focus and move caret to end of new block
    useEffect(() => {
        if (justAddedBlockId && blockRefs.current[justAddedBlockId]) {
            const el = blockRefs.current[justAddedBlockId];
            el.focus();
            // Move caret to end
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            setJustAddedBlockId(null);
        }
    }, [justAddedBlockId]);

    const [editingContent, setEditingContent] = useState('');
    const [editingBlockId, setEditingBlockId] = useState(null);

    // 2. On mount, migrate any blocks with placeholder content to empty string
    useEffect(() => {
        setBlocks(prevBlocks => prevBlocks.map(block => {
            const placeholders = {
                paragraph: "Text",
                h1: 'Heading 1',
                h2: 'Heading 2',
                h3: 'Heading 3',
                checklist: 'Checklist item...',
                quote: 'Quote...',
                code: 'Code...'
            };
            if (block.content && block.content.trim() === placeholders[block.type]) {
                return { ...block, content: '' };
            }
            return block;
        }));
    }, []);

    // 3. When rendering, treat placeholder content as empty (defensive, but should not be needed after migration)
    const getDisplayContent = (block) => {
        const placeholders = {
            paragraph: "Text",
            h1: 'Heading 1',
            h2: 'Heading 2',
            h3: 'Heading 3',
            checklist: 'Checklist item...',
            quote: 'Quote...',
            code: 'Code...'
        };
        return (block.content && block.content.trim() === placeholders[block.type]) ? '' : block.content;
    };

    const [sidebarContextMenu, setSidebarContextMenu] = useState({ show: false, x: 0, y: 0, folderId: null });

    // Add this to the folder item div in the sidebar:
    // onContextMenu={(e) => {
    //   e.preventDefault();
    //   setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: folder.id });
    // }}

    // Add this at the end of the main return:
    {sidebarContextMenu.show && (
      <div
        className="sidebar-context-menu"
        style={{ position: 'fixed', top: sidebarContextMenu.y, left: sidebarContextMenu.x, zIndex: 9999, background: '#232323', color: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: '8px 0', minWidth: 120 }}
        onClick={() => setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null })}
        onContextMenu={e => e.preventDefault()}
      >
        <div
          className="sidebar-context-menu-item"
          style={{ padding: '8px 16px', cursor: 'pointer', color: '#FF6B6B' }}
          onClick={() => {
            handleDeleteFolder(sidebarContextMenu.folderId);
            setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null });
          }}
        >
          Delete Folder
        </div>
      </div>
    )}

    // Add a useEffect to close the context menu on click elsewhere
    useEffect(() => {
      const handleClick = () => setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null });
      if (sidebarContextMenu.show) {
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
      }
    }, [sidebarContextMenu.show]);

    const [showNewSubfolderModal, setShowNewSubfolderModal] = useState(false);
    const [newSubfolderName, setNewSubfolderName] = useState('');
    const [subfolderParentId, setSubfolderParentId] = useState(null);

    const handleCreateSubfolder = async () => {
      if (!newSubfolderName.trim() || !subfolderParentId) return;
      await handleCreateFolder(newSubfolderName, subfolderParentId);
      setShowNewSubfolderModal(false);
      setNewSubfolderName('');
      setSubfolderParentId(null);
    };

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
                        className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        <FiHome className="nav-icon" />
                        <span>Home</span>
                    </div>
                    <div 
                        className={`nav-item ${location.pathname === '/night-owl-flashcards' ? 'active' : ''}`}
                        onClick={() => navigate('/night-owl-flashcards')}
                    >
                        <FiBook className="nav-icon" />
                        <span>Flashcards</span>
                    </div>
                    <div className="folders-section">
                        <div className="folders-header">
                            <h3>Folders</h3>
                            <button className="create-folder-btn" onClick={() => setShowNewFolderModal(true)}>
                                <FiPlus />
                            </button>
                        </div>
                        <div className="folders-list">
                            {folders.map(folder => (
                                <div key={folder.id}>
                                    <div 
                                        className={`folder-item ${selectedFolder?.id === folder.id && activeView === 'folder' ? 'active' : ''}`}
                                        onClick={(e) => handleFolderClick(folder.id, e)}
                                        onContextMenu={(e) => {
                                          e.preventDefault();
                                          setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: folder.id });
                                        }}
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
                                    </div>
                                    {expandedFolders[folder.id] && (
                                        <div className={`folder-contents ${expandedFolders[folder.id] ? 'expanded' : ''}`}>
                                            {/* Render subfolders first, directly under folder-contents */}
                                            {folder.sub_folders && folder.sub_folders.map(subfolder => (
                                                <div key={subfolder.id} className="subfolder-item">
                                                    <div 
                                                        className={`folder-item subfolder ${selectedFolder?.id === subfolder.id && activeView === 'folder' ? 'active' : ''}`}
                                                        onClick={(e) => { console.log('Subfolder click:', subfolder.id); handleFolderClick(subfolder.id, e); }}
                                                        onContextMenu={(e) => {
                                                          e.preventDefault();
                                                          setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: subfolder.id });
                                                        }}
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <button
                                                            className={`folder-expand-btn${expandedFolders[subfolder.id] ? ' expanded' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); toggleFolder(subfolder.id, e); }}
                                                        >
                                                            {expandedFolders[subfolder.id] ? 'v' : '>'}
                                                        </button>
                                                        <img 
                                                            src={expandedFolders[subfolder.id] ? openFolderIcon : closedFolderIcon} 
                                                            alt="subfolder" 
                                                            className="folder-icon"
                                                            style={{ width: '14px', height: '14px' }}
                                                        />
                                                        <span className="folder-name" title={subfolder.name}>{subfolder.name.length > 10 ? subfolder.name.slice(0, 7) + '...' : subfolder.name}</span>
                                                    </div>
                                                    {expandedFolders[subfolder.id] && (
                                                        <div className={`folder-contents expanded`}>
                                                            {/* Recursively render subfolders and items for this subfolder */}
                                                            {subfolder.sub_folders && subfolder.sub_folders.map(childSubfolder => (
                                                                <div key={childSubfolder.id} className="subfolder-item">
                                                                    <div 
                                                                        className={`folder-item subfolder ${selectedFolder?.id === childSubfolder.id && activeView === 'folder' ? 'active' : ''}`}
                                                                        onClick={(e) => { console.log('Subfolder click:', childSubfolder.id); handleFolderClick(childSubfolder.id, e); }}
                                                                        onContextMenu={(e) => {
                                                                            e.preventDefault();
                                                                            setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: childSubfolder.id });
                                                                        }}
                                                                        style={{ fontSize: '12px' }}
                                                                    >
                                                                        <img 
                                                                            src={closedFolderIcon} 
                                                                            alt="subfolder" 
                                                                            className="folder-icon"
                                                                            style={{ width: '14px', height: '14px' }}
                                                                        />
                                                                        <span className="folder-name" title={childSubfolder.name}>{childSubfolder.name.length > 10 ? childSubfolder.name.slice(0, 7) + '...' : childSubfolder.name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {/* Render items for this subfolder if any */}
                                                            {subfolder.items && subfolder.items.length > 0 && renderFolderItems(subfolder)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Render folder items (documents, decks, etc.) but do NOT show empty state in sidebar */}
                                            {folder.items && folder.items.length > 0 && renderFolderItems(folder)}
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

            {showNewFolderModal && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal">
                        <h2>Create New Folder</h2>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name..."
                            className="dashboard-modal-input"
                        />
                        <div className="dashboard-modal-actions">
                            <button onClick={() => setShowNewFolderModal(false)} className="dashboard-modal-btn cancel">Cancel</button>
                            <button onClick={handleCreateFolder} className="dashboard-modal-btn create">Create</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Floating Format Bar */}
            {formatBar.show && (
                <div
                    ref={formatBarRef}
                    style={{
                        position: 'absolute',
                        left: formatBar.x,
                        top: formatBar.y,
                        zIndex: 2000,
                        background: '#232323',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        padding: '6px 12px',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        border: '1px solid #444',
                    }}
                >
                    <button onClick={() => formatSelection('bold')} style={{fontWeight: 'bold', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18}}>B</button>
                    <button onClick={() => formatSelection('italic')} style={{fontStyle: 'italic', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18}}>I</button>
                    <button onClick={() => formatSelection('hiliteColor', 'rgba(255,250,205,0.5)')} style={{background: 'rgba(255,250,205,0.5)', border: 'none', color: '#232323', cursor: 'pointer', fontSize: 18, borderRadius: 4, padding: '0 8px'}}>H</button>
                </div>
            )}
            {sidebarContextMenu.show && (
              <div
                className="sidebar-context-menu"
                style={{ position: 'fixed', top: sidebarContextMenu.y, left: sidebarContextMenu.x, zIndex: 9999, background: '#232323', color: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: '8px 0', minWidth: 120 }}
                onClick={() => setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null })}
                onContextMenu={e => e.preventDefault()}
              >
                <div
                  className="sidebar-context-menu-item"
                  style={{ padding: '8px 16px', cursor: 'pointer', color: '#FF6B6B' }}
                  onClick={() => {
                    handleDeleteFolder(sidebarContextMenu.folderId);
                    setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null });
                  }}
                >
                  Delete Folder
                </div>
              </div>
            )}
            {showNewSubfolderModal && (
              <div className="dashboard-modal-overlay">
                <div className="dashboard-modal">
                  <h2>Create Subfolder</h2>
                  <input
                    type="text"
                    value={newSubfolderName}
                    onChange={e => setNewSubfolderName(e.target.value)}
                    placeholder="Enter subfolder name..."
                    className="dashboard-modal-input"
                  />
                  <div className="dashboard-modal-actions">
                    <button onClick={() => setShowNewSubfolderModal(false)} className="dashboard-modal-btn cancel">Cancel</button>
                    <button onClick={handleCreateSubfolder} className="dashboard-modal-btn create">Create</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
}

export default Dashboard; 