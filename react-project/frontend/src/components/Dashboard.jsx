import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiHome, FiSettings, FiLogOut, FiFolder, FiPlus, FiBook, FiLayers, FiCheckSquare, FiTrendingUp, FiAward, FiShare2, FiStar, FiMoreVertical, FiUsers, FiFileText, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import closedFolderIcon from '../assets/ClosedFolder.svg';
import openFolderIcon from '../assets/OpenFolder.svg';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import './Dashboard.css';

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
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, folderId: null });
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
        folders: false,
        decks: false,
        cards: false,
        delete: false
    });

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

    // Fetch folders on component mount
    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        setIsLoading(prev => ({ ...prev, folders: true }));
        try {
            const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}folders/user/`);
            if (!response) return;

            if (response.ok) {
                const foldersData = await response.json();
                
                // Fetch all decks to get counts
                const decksResponse = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/`);
                if (!decksResponse) return;

                if (decksResponse.ok) {
                    const allDecks = await decksResponse.json();
                    
                    // Update folders with deck counts
                    const foldersWithCounts = foldersData.map(folder => ({
                        ...folder,
                        deckCount: allDecks.filter(deck => deck.folder === folder.id).length
                    }));

                    setFolders(foldersWithCounts);
                } else {
                    console.error('Failed to fetch decks:', await decksResponse.text());
                }
            } else {
                console.error('Failed to fetch folders:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, folders: false }));
        }
    };

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
        setShowWelcome(true);

        // Store the current login time
        localStorage.setItem('lastLogin', new Date().toISOString());

        // Hide welcome message after 3 seconds
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleAddItem = (folderId, itemType) => {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                return {
                    ...folder,
                    items: [...folder.items, {
                        id: Date.now(),
                        type: itemType,
                        name: `New ${itemType}`
                    }]
                };
            }
            return folder;
        }));
    };

    // Placeholder handlers for the new icons
    const handleShare = () => {
        console.log('Share clicked');
        // Implement share functionality
    };

    const handleStar = () => {
        console.log('Star clicked');
        // Implement star functionality
    };

    const handleSettings = () => {
        console.log('Settings clicked');
        // Implement settings functionality
    };

    const handleCollab = () => {
        console.log('Collaborate clicked');
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
            await fetchFolderDecks(folderId);
        }
    };

    const handleQuizClick = (quiz) => {
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
        // Load quiz questions (mock data for now)
        setQuizQuestions([
            {
                id: 1,
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correctAnswer: "Paris"
            },
            {
                id: 2,
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correctAnswer: "Mars"
            }
        ]);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
    };

    const handleSaveQuestion = (updatedQuestion) => {
        setQuizQuestions(questions => 
            questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
        );
        setEditingQuestion(null);
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            question: "New Question",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: "Option 1"
        };
        setQuizQuestions([...quizQuestions, newQuestion]);
        setEditingQuestion(newQuestion);
    };

    const handleContextMenu = (e, folderId) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            folderId
        });
    };

    const handleClick = () => {
        setContextMenu({ show: false, x: 0, y: 0, folderId: null });
    };

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const fetchFolderDecks = async (folderId) => {
        setIsLoading(prev => ({ ...prev, decks: true }));
        try {
            const folder = folders.find(f => f.id === folderId);
            if (!folder) {
                console.error('Folder not found');
                return;
            }

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

                    const mappedDecks = folderDecks.map(deck => ({
                        id: deck.id,
                        type: 'deck',
                        name: deck.title,
                        subject: deck.subject,
                        cardCount: allCards.filter(card => card.card_deck === deck.id).length
                    }));

                    setSelectedFolder(prevFolder => ({
                        ...prevFolder,
                        items: mappedDecks
                    }));

                    setFolders(prevFolders => {
                        return prevFolders.map(f => {
                            const folderDeckCount = allDecks.filter(deck => deck.folder === f.id).length;
                            
                            if (f.id === folderId) {
                                return {
                                    ...f,
                                    items: mappedDecks,
                                    deckCount: folderDeckCount
                                };
                            }
                            return {
                                ...f,
                                deckCount: folderDeckCount
                            };
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching decks:', error);
        } finally {
            setIsLoading(prev => ({ ...prev, decks: false }));
        }
    };

    const handleFolderClick = (folderId) => {
        const folder = folders.find(f => f.id === folderId);
        console.log('Selected folder:', folder);
        handleNavigation('folder', folder);
        fetchFolderDecks(folderId);
    };

    const handleCreateDeck = async () => {
        if (newDeckName.trim() && newDeckSubject.trim()) {
            try {
                const response = await makeAuthenticatedRequest(`${import.meta.env.VITE_API_URL}flashcards/deck/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: newDeckName.trim(),
                        subject: newDeckSubject.trim(),
                        folder_name: selectedFolder.name
                    })
                });
                
                if (!response) return; // Request failed due to auth issues

                if (response.ok) {
                    // After successful creation, fetch updated decks
                    await fetchFolderDecks(selectedFolder.id);
                    setNewDeckName('');
                    setNewDeckSubject('');
                    setShowNewDeckModal(false);
                } else {
                    console.error('Failed to create deck:', await response.text());
                }
            } catch (error) {
                console.error('Error creating deck:', error);
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

    const handleDeckClick = async (deckId) => {
        // First ensure we have the folder's decks loaded
        if (!selectedFolder?.items) {
            await fetchFolderDecks(selectedFolder.id);
        }
        
        const deck = selectedFolder.items.find(item => item.id === deckId);
        if (!deck) {
            console.error('Deck not found');
            return;
        }
        
        // Always update the view and selected deck, even if we're in the same folder
        setActiveView('deck');
        setSelectedDeck(deck);
        
        // Fetch the cards for the new deck
        await fetchDeckCards(deckId);
        
        // Update navigation history
        const newHistory = navHistory.slice(0, currentNavIndex + 1);
        newHistory.push({ view: 'deck', folder: selectedFolder, deck });
        setNavHistory(newHistory);
        setCurrentNavIndex(newHistory.length - 1);
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
    const handleNavigation = (view, folder = null, deck = null) => {
        // If we're not at the end of the history, remove future entries
        const newHistory = navHistory.slice(0, currentNavIndex + 1);
        // Add new navigation state
        newHistory.push({ view, folder, deck });
        setNavHistory(newHistory);
        setCurrentNavIndex(newHistory.length - 1);
        setActiveView(view);
        setSelectedFolder(folder);
        setSelectedDeck(deck);
    };

    // Function to go back
    const handleBack = () => {
        if (currentNavIndex > 0) {
            const prevState = navHistory[currentNavIndex - 1];
            setCurrentNavIndex(currentNavIndex - 1);
            setActiveView(prevState.view);
            setSelectedFolder(prevState.folder);
            setSelectedDeck(prevState.deck);
            if (prevState.folder) {
                fetchFolderDecks(prevState.folder.id);
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
            if (nextState.folder) {
                fetchFolderDecks(nextState.folder.id);
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

    return (
        <div className="dashboard-container">
            {/* Notification */}
            {notification.show && (
                <div className="notification">
                    {notification.message}
                </div>
            )}

            {/* Welcome Message */}
            {showWelcome && (
                <div className={`welcome-message ${isNewUser ? 'new-user' : 'returning-user'}`}>
                    {isNewUser ? `Welcome ${user?.email?.split('@')[0]}` : 'Welcome Back!'}
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
                                        onClick={() => handleFolderClick(folder.id)}
                                        onContextMenu={(e) => handleContextMenu(e, folder.id)}
                                    >
                                        <button 
                                            className={`folder-expand-btn ${expandedFolders[folder.id] ? 'expanded' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFolder(folder.id, e);
                                            }}
                                        >
                                            &gt;
                                        </button>
                                        <img 
                                            src={expandedFolders[folder.id] ? openFolderIcon : closedFolderIcon} 
                                            alt="folder" 
                                            className="folder-icon"
                                        />
                                        <span className="folder-name" title={folder.name}>{folder.name}</span>
                                        <span className="folder-count">{folder.deckCount || 0}</span>
                                    </div>
                                    {expandedFolders[folder.id] && folder.items && (
                                        <div className="folder-contents">
                                            {folder.items.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    className={`folder-content-item ${selectedDeck?.id === item.id && activeView === 'deck' ? 'active' : ''}`}
                                                    onClick={async () => {
                                                        // Update UI state immediately
                                                        setSelectedFolder(folder);
                                                        setActiveView('deck');
                                                        setSelectedDeck(item);
                                                        
                                                        // Update navigation history immediately
                                                        const newHistory = navHistory.slice(0, currentNavIndex + 1);
                                                        newHistory.push({ view: 'deck', folder: folder, deck: item });
                                                        setNavHistory(newHistory);
                                                        setCurrentNavIndex(newHistory.length - 1);
                                                        
                                                        // Fetch data in the background
                                                        Promise.all([
                                                            fetchFolderDecks(folder.id),
                                                            fetchDeckCards(item.id)
                                                        ]).catch(error => {
                                                            console.error('Error fetching data:', error);
                                                        });
                                                    }}
                                                >
                                                    <FiLayers className="content-icon" />
                                                    <span className="content-name">{item.name}</span>
                                                </div>
                                            ))}
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
                            {showSettingsDropdown && (activeView === 'folder' || activeView === 'deck') && (
                                <div className="settings-dropdown">
                                    <button 
                                        className="dropdown-item delete-option"
                                        onClick={handleDelete}
                                    >
                                        Delete {activeView === 'folder' ? 'Folder' : 'Deck'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="action-icon-button" onClick={handleCollab}><FiUsers /></button>
                    </div>
                </div>

                {activeView === 'dashboard' && (
                    <div className="content-section">
                        {isLoading.folders ? (
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
                    <div className="content-section">
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
                                    onClick={() => handleAddItem(selectedFolder.id, 'quiz')}
                                >
                                    <FiFileText /> Add Quiz
                                </button>
                            </div>
                        </div>
                        {isLoading.decks ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="folder-items">
                                {selectedFolder.items && selectedFolder.items.length > 0 ? (
                                    selectedFolder.items.map(item => (
                                        item.type === 'deck' ? (
                                            <div 
                                                key={item.id} 
                                                className={`deck-item ${selectedDeck?.id === item.id && activeView === 'deck' ? 'active' : ''}`} 
                                                onClick={() => handleDeckClick(item.id)}
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
                                            <div key={item.id} className="quiz-item">
                                                <FiFileText className="quiz-icon" />
                                                <div className="quiz-info">
                                                    <div className="quiz-name">{item.name}</div>
                                                    <div className="quiz-stats">0 questions • No attempts yet</div>
                                                </div>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No decks or quizzes yet. Create one to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'deck' && selectedDeck && (
                    <div className="content-section">
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
                        {isLoading.cards ? (
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
            </div>

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Folder</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                        <div className="modal-actions">
                            <button className="create-btn" onClick={handleCreateFolder}>Create</button>
                            <button className="cancel-btn" onClick={() => setShowNewFolderModal(false)}>Cancel</button>
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
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Deck</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            placeholder="Enter deck name"
                        />
                        <input
                            type="text"
                            className="folder-input"
                            value={newDeckSubject}
                            onChange={(e) => setNewDeckSubject(e.target.value)}
                            placeholder="Enter subject"
                        />
                        <div className="modal-actions">
                            <button className="create-btn" onClick={handleCreateDeck}>Create</button>
                            <button className="cancel-btn" onClick={() => setShowNewDeckModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Card Modal */}
            {showNewCardModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Card</h3>
                        <input
                            type="text"
                            className="folder-input"
                            value={newCard.question}
                            onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                            placeholder="Enter question"
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
                            <button className="create-btn" onClick={handleCreateCard}>Create</button>
                            <button className="cancel-btn" onClick={() => setShowNewCardModal(false)}>Cancel</button>
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
                        className="context-menu-item"
                        onClick={() => {
                            handleDeleteFolder(contextMenu.folderId);
                            setContextMenu({ show: false, x: 0, y: 0, folderId: null });
                        }}
                    >
                        Delete Folder
                    </button>
                </div>
            )}
        </div>
    );
}

export default Dashboard; 