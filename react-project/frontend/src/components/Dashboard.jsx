import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { formatDateForDisplay } from '../utils/dateUtils';


// Import extracted components
import Block from './Block';
import Notification from './Notification';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FolderView from './FolderView';
import DeckView from './DeckView';

import FlashcardsDashboard from './FlashcardsDashboard';
import NewFolderModal from './modals/NewFolderModal';
import NewSubfolderModal from './modals/NewSubfolderModal';
import ContextMenu from './ContextMenu';
import DashboardHome from './DashboardHome';
import QuizView from './QuizView';
import ReviewCards from './ReviewCards';
import Calendar from './Calendar';
import ReviewCardsDashboard from './ReviewCardsDashboard';

// Import styles
import './Dashboard.css';
import './FlashcardsNightOwl.css';
import './DashboardHome.css';

function Dashboard({ initialView }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, login } = useAuth();
    
    // State management
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionTimeout, setTransitionTimeout] = useState(null);
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
    const [decks, setDecks] = useState([]);
    const [dueTodayCount, setDueTodayCount] = useState(0);
    const [upcomingCards, setUpcomingCards] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [showNewItemDropdown, setShowNewItemDropdown] = useState(false);
    const fileInputRef = useRef(null);

    const [showNewSubfolderModal, setShowNewSubfolderModal] = useState(false);
    const [newSubfolderName, setNewSubfolderName] = useState('');
    const [subfolderParentId, setSubfolderParentId] = useState(null);
    const [sidebarContextMenu, setSidebarContextMenu] = useState({ show: false, x: 0, y: 0, folderId: null });


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

    // Utility functions
    const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, Math.max(level - 1, 0)));
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const nextLevelXp = xpForLevel(level);
    const progress = Math.max(0, Math.min((xp / nextLevelXp) * 100, 100));

    // API functions
    const fetchAllDecks = async () => {
        const response = await api.get('/flashcards/deck/');
        return response.data;
    };

    const fetchAllQuizzes = async () => {
        const response = await api.get('/test/quiz/');
        return response.data;
    };

    const fetchFolders = async () => {
        if (isLoading.initialLoad) {
            setIsLoading(prev => ({ ...prev, folders: true }));
        }
        try {
            const response = await api.get('/folders/user/');
            if (!response) return;
            const foldersData = response.data;

            if (foldersData.xp !== undefined && foldersData.level !== undefined) {
                login({ ...user, xp: foldersData.xp, level: foldersData.level });
            }
            
            const foldersWithCounts = (foldersData.folders || foldersData).map(folder => {
                return {
                    ...folder,
                    documentCount: folder.content_num || 0,
                    deckCount: 0,
                    quizCount: 0,
                    sub_folders: folder.sub_folders || []
                };
            });
            setFolders(foldersWithCounts);
            
            if (selectedFolder && isMounted) {
                const updatedSelectedFolder = foldersWithCounts.find(f => f.id === selectedFolder.id);
                if (updatedSelectedFolder) {
                    setSelectedFolder(updatedSelectedFolder);
                }
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            if (isMounted) {
                setIsLoading(prev => ({ ...prev, folders: false, initialLoad: false }));
            }
        }
    };

    // Event handlers
    const handleCreateFolder = async (name = newFolderName, parentId = null) => {
        if (name.trim()) {
            try {
                const body = parentId
                    ? { name: name.trim(), folder_id: parentId }
                    : { name: name.trim() };
                const response = await api.post('/folders/user/', body);
                
                if (response.status === 200 || response.status === 201) {
                    const newFolderData = response.data;
                    if (newFolderData.folder) {
                        setFolders(prev => [...prev, newFolderData.folder]);
                        setNewFolderName('');
                        setShowNewFolderModal(false);
                    } else if (newFolderData.sub_folder) {
                        fetchFolders();
                        setShowNewSubfolderModal(false);
                        setNewSubfolderName('');
                        setSubfolderParentId(null);
                    }
                }
            } catch (error) {
                console.error('Error creating folder:', error);
            }
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            const folder = folders.find(f => f.id === folderId);
            const response = await api.delete(`folders/user/${folderId}/`);
            
            if (!response) return;

            if (response.status === 200 || response.status === 204) {
                setFolders(folders.filter(f => f.id !== folderId));
                showNotification(`${folder.name} successfully deleted`);
                
                if (selectedFolder?.id === folderId) {
                    for (let i = navHistory.length - 1; i >= 0; i--) {
                        const prevState = navHistory[i];
                        if (prevState.view !== 'folder' || prevState.folder?.id !== folderId) {
                            handleNavigation(prevState.view, prevState.folder, prevState.deck);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    const handleFolderClick = async (folderId, e) => {
        if (e.detail > 1) return;
        
        console.log('Folder clicked:', folderId);
        setIsTransitioning(true);
        
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }
        
        try {
            console.log('Fetching folder contents...');
            const [documentsResponse, quizzesResponse] = await Promise.all([
                api.get(`documents/notes/${folderId}/`),
                api.get('test/quiz/')
            ]);
            
            let folderDocuments = [];
            let folderQuizzes = [];

            if (documentsResponse && documentsResponse.status === 200) {
                folderDocuments = documentsResponse.data;
                console.log('Documents found:', folderDocuments.length);
            }

            if (quizzesResponse && quizzesResponse.status === 200) {
                const allQuizzes = quizzesResponse.data;
                folderQuizzes = allQuizzes.filter(quiz => quiz.folder === folderId);
                console.log('Quizzes found:', folderQuizzes.length);
            }

            const folder = folders.find(f => f.id === folderId);
            if (!folder) {
                console.error('Folder not found:', folderId);
                setIsTransitioning(false);
                return;
            }

            console.log('Original folder:', folder);

            const existingItems = folder.items || [];
            const existingNonDocQuizItems = existingItems.filter(item => 
                item.type !== 'document' && item.type !== 'quiz'
            );

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

            console.log('Updated folder:', updatedFolder);

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
            
            setSelectedFolder(updatedFolder);
            setActiveView('folder');
        
            console.log('Setting activeView to folder, selectedFolder:', updatedFolder);
        
        const timeout = setTimeout(() => {
            setIsTransitioning(false);
            }, 300);
        
        setTransitionTimeout(timeout);
        } catch (error) {
            console.error('Error fetching folder contents:', error);
            setIsTransitioning(false);
        }
    };

    const toggleFolder = async (folderId, e) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));

        if (!expandedFolders[folderId]) {
            try {
                const [documentsResponse, allDecks, allQuizzes] = await Promise.all([
                    api.get('documents/notes/'),
                    fetchAllDecks(),
                    fetchAllQuizzes()
                ]);

                if (!isMounted) return;

                let allDocuments = [];
                if (documentsResponse && documentsResponse.status === 200) {
                    allDocuments = documentsResponse.data;
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

    const handleNavigation = async (view, folder = null, deck = null, quiz = null) => {
        setActiveView(view);
        setSelectedFolder(folder);
        setSelectedDeck(deck);
        setSelectedQuiz(quiz);
            setSelectedDocument(null);
    };

    const handleBack = () => {
        if (currentNavIndex > 0) {
            const prevState = navHistory[currentNavIndex - 1];
            setCurrentNavIndex(currentNavIndex - 1);
            setActiveView(prevState.view);
            setSelectedFolder(prevState.folder);
            setSelectedDeck(prevState.deck);
            setSelectedQuiz(prevState.quiz);
        }
    };

    const handleForward = () => {
        if (currentNavIndex < navHistory.length - 1) {
            const nextState = navHistory[currentNavIndex + 1];
            setCurrentNavIndex(currentNavIndex + 1);
            setActiveView(nextState.view);
            setSelectedFolder(nextState.folder);
            setSelectedDeck(nextState.deck);
            setSelectedQuiz(nextState.quiz);
        }
    };

    const handleDashboardClick = () => {
        handleNavigation('dashboard', null, null);
    };

    const handleSidebarNav = (view) => {
        handleNavigation(view, null, null);
    };

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        setShowSettingsDropdown(!showSettingsDropdown);
    };

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

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: '' });
        }, 3000);
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

    const handleShare = () => {
        // Implement share functionality
    };

    const handleStar = () => {
        // Implement star functionality
    };

    const handleCollab = () => {
        // Implement collaboration functionality
    };

    const handleAddItem = (folderId, itemType) => {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                const newItem = itemType === 'deck' ? {
                    id: Date.now(),
                    type: 'deck',
                    name: `New deck`,
                    subject: ''
                } : {
                    id: Date.now(),
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

    

    const handleDeckClick = async (deckId, e) => {
        if (e.detail > 1) return;
        
        setIsTransitioning(true);
        
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }

        try {
            let targetFolder = null;
            let targetDeck = null;
            
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

            handleNavigation('deck', targetFolder, targetDeck, null);
            
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
            
            setTransitionTimeout(timeout);
            
            if (selectedFolder?.id !== targetFolder.id) {
                await fetchFolderDecks(targetFolder.id);
            }
            await fetchDeckCards(deckId);
            
        } catch (error) {
            console.error('Error switching to deck:', error);
            setIsTransitioning(false);
        }
    };

    const handleQuizClick = async (quizId, e) => {
        try {
            setIsTransitioning(true);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await api.get(`test/quiz/${quizId}/`);
            if (!response) return;

            if (response.status === 200) {
                const quizData = response.data;
                setSelectedQuiz(quizData);
                
                const questions = await fetchQuizQuestions(quizId);
                if (questions) {
                    setQuizQuestions(questions);
                }
                
                handleNavigation('quiz', selectedFolder, null, quizData);
                
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 50);
            } else {
                console.error('Failed to fetch quiz:', response.data?.message || 'Unknown error');
                setIsTransitioning(false);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setIsTransitioning(false);
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

    const handleCreateSubfolder = async () => {
        if (!newSubfolderName.trim() || !subfolderParentId) return;
        await handleCreateFolder(newSubfolderName, subfolderParentId);
        setShowNewSubfolderModal(false);
        setNewSubfolderName('');
        setSubfolderParentId(null);
    };

    const fetchFolderDecks = async (folderId) => {
        // Implementation for fetching folder decks
    };

    const fetchDeckCards = async (deckId) => {
        setIsLoading(prev => ({ ...prev, cards: true }));
        try {
            const response = await api.get('/flashcards/cards/');
            if (!response) return;

            if (response.status === 200) {
                const allCards = response.data;
                const deckCards = allCards.filter(card => card.card_deck === deckId);
                setCards(deckCards);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, cards: false }));
        }
    };

    const fetchQuizQuestions = async (quizId) => {
        // Implementation for fetching quiz questions
    };

    const getFolderItemCount = (folder) => {
        return folder.items ? folder.items.length : 0;
    };

    

    // Effects
    useEffect(() => {
        setIsMounted(true);
        fetchFolders();
        
        return () => {
            setIsMounted(false);
        };
    }, []);

    // Apply Night Owl background for flashcards view
    useEffect(() => {
        if (activeView === 'flashcards') {
            document.documentElement.classList.add('nightowl-root-bg');
            document.body.classList.add('nightowl-root-bg');
        } else {
            document.documentElement.classList.remove('nightowl-root-bg');
            document.body.classList.remove('nightowl-root-bg');
        }

        return () => {
            document.documentElement.classList.remove('nightowl-root-bg');
            document.body.classList.remove('nightowl-root-bg');
        };
    }, [activeView]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const lastLogin = localStorage.getItem('lastLogin');
        const isFirstLogin = !lastLogin;
        
        setIsNewUser(isFirstLogin);
        showNotification(isFirstLogin ? `Welcome ${user?.email?.split('@')[0]}` : 'Welcome Back!');

        localStorage.setItem('lastLogin', new Date().toISOString());
    }, []);

    // Render content based on active view
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardHome />;
            case 'folder':
                return (
                    <FolderView
                        selectedFolder={selectedFolder}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        showNewItemDropdown={showNewItemDropdown}
                        setShowNewItemDropdown={setShowNewItemDropdown}
                        handleAddItem={handleAddItem}
                        handleDeckClick={handleDeckClick}
                        handleQuizClick={handleQuizClick}
                        handleContextMenu={handleContextMenu}
                        getFolderItemCount={getFolderItemCount}
                    />
                );
            case 'deck':
                return (
                    <DeckView
                        selectedDeck={selectedDeck}
                        cards={cards}
                        showNewCardModal={showNewCardModal}
                        setShowNewCardModal={setShowNewCardModal}
                        newCard={newCard}
                        setNewCard={setNewCard}
                        handleCreateCard={() => {}}
                        handleDeleteCard={() => {}}
                        handleEditCard={() => {}}
                        isLoading={isLoading}
                    />
                );

            case 'flashcards':
                return (
                    <FlashcardsDashboard
                        selectedReview={selectedReview}
                        setSelectedReview={setSelectedReview}
                        dueTodayCount={dueTodayCount}
                        upcomingCards={upcomingCards}
                        reviewProgress={reviewProgress}
                        isTransitioning={isTransitioning}
                    />
                );
            case 'quiz':
                return <QuizView quiz={selectedQuiz} questions={quizQuestions} />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="dashboard-container">
            <Notification notification={notification} />
            
            <Sidebar
                user={user}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                logout={logout}
                navigate={navigate}
                location={location}
                folders={folders}
                selectedFolder={selectedFolder}
                activeView={activeView}
                expandedFolders={expandedFolders}
                setShowNewFolderModal={setShowNewFolderModal}
                handleFolderClick={handleFolderClick}
                toggleFolder={toggleFolder}
                setSidebarContextMenu={setSidebarContextMenu}
            />

            <div className="main-area">
                <Navbar
                    currentNavIndex={currentNavIndex}
                    navHistory={navHistory}
                    getCurrentViewTitle={getCurrentViewTitle}
                    handleBack={handleBack}
                    handleForward={handleForward}
                    handleShare={handleShare}
                    handleStar={handleStar}
                    handleSettingsClick={handleSettingsClick}
                    handleCollab={handleCollab}
                    showSettingsDropdown={showSettingsDropdown}
                />

                <div className="tabs-content-container">
                    {renderContent()}
                </div>
            </div>

            <NewFolderModal
                showNewFolderModal={showNewFolderModal}
                newFolderName={newFolderName}
                setNewFolderName={setNewFolderName}
                setShowNewFolderModal={setShowNewFolderModal}
                handleCreateFolder={handleCreateFolder}
            />

            <NewSubfolderModal
                showNewSubfolderModal={showNewSubfolderModal}
                newSubfolderName={newSubfolderName}
                setNewSubfolderName={setNewSubfolderName}
                setShowNewSubfolderModal={setShowNewSubfolderModal}
                handleCreateSubfolder={handleCreateSubfolder}
            />

            <ContextMenu
                sidebarContextMenu={sidebarContextMenu}
                setSidebarContextMenu={setSidebarContextMenu}
                handleDeleteFolder={handleDeleteFolder}
            />
        </div>
    );
}

export default Dashboard;