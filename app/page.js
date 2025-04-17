'use client';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRzcBBK1LhhiVr4wy8zWV3dM2my_nBpq8",
  authDomain: "utsss-63fbf.firebaseapp.com",
  projectId: "utsss-63fbf",
  storageBucket: "utsss-63fbf.firebasestorage.app",
  messagingSenderId: "240542266582",
  appId: "1:240542266582:web:0aed6b2306a99c694b0577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function PortfolioPage() {
  // Theme state
  const [theme, setTheme] = useState('light');
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Portfolio items data
  const portfolioItems = [
    {
      id: 1,
      title: "University Website Redesign",
      date: "2023",
      description: "Led a team to redesign the university's department website with modern UI/UX principles.",
      fullDescription: "This project involved conducting user research, creating wireframes, and implementing a responsive design using React and Tailwind CSS. The new design improved user engagement by 40% and reduced bounce rates.",
      tags: ["Web Design", "UI/UX", "React"]
    },
    {
      id: 2,
      title: "E-commerce Mobile App",
      date: "2022",
      description: "Developed a cross-platform mobile application for a local boutique.",
      fullDescription: "Built with React Native, this app features product listings, a shopping cart, and payment integration. The app boosted the boutique's online sales by 65% in the first quarter after launch.",
      tags: ["Mobile Development", "React Native", "Firebase"]
    },
    {
      id: 3,
      title: "Data Visualization Dashboard",
      date: "2021",
      description: "Created an interactive dashboard for analyzing campus energy consumption.",
      fullDescription: "This project used D3.js to visualize complex energy usage data across campus buildings. The dashboard helped the university identify opportunities for energy savings, leading to a 15% reduction in electricity costs.",
      tags: ["Data Visualization", "JavaScript", "D3.js"]
    }
  ];

  // Active portfolio item for detail view
  const [activeItem, setActiveItem] = useState(null);

  // Comment and rating states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your portfolio assistant. How can I help you today?' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Set initial theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Fetch comments and ratings from Firestore
  useEffect(() => {
    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    const ratingsQuery = collection(db, 'ratings');
    const unsubscribeRatings = onSnapshot(ratingsQuery, (snapshot) => {
      const ratingsData = snapshot.docs.map(doc => doc.data().rating);
      if (ratingsData.length > 0) {
        const sum = ratingsData.reduce((a, b) => a + b, 0);
        const avg = sum / ratingsData.length;
        setAverageRating(avg.toFixed(1));
        setTotalRatings(ratingsData.length);
      }
    });

    return () => {
      unsubscribeComments();
      unsubscribeRatings();
    };
  }, []);

  // Submit comment
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !name.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        name,
        text: newComment,
        timestamp: new Date()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Submit rating
  const submitRating = async (selectedRating) => {
    try {
      await addDoc(collection(db, 'ratings'), {
        rating: selectedRating,
        timestamp: new Date()
      });
      setRating(0);
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newUserMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Head>
        <title>My Portfolio</title>
        <meta name="description" content="Professional portfolio showcasing my work and experience" />
      </Head>

      {/* Navbar */}
      <nav className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">MyPortfolio</div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <a href="#home" className="hover:text-blue-500 transition">Home</a>
            <a href="#about" className="hover:text-blue-500 transition">About</a>
            <a href="#portfolio" className="hover:text-blue-500 transition">Portfolio</a>
            <a href="#contact" className="hover:text-blue-500 transition">Contact</a>
            <a href="#feedback" className="hover:text-blue-500 transition">Feedback</a>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="container mx-auto px-6 py-2 flex flex-col space-y-2">
              <a href="#home" onClick={closeMobileMenu} className="py-2 hover:text-blue-500 transition">Home</a>
              <a href="#about" onClick={closeMobileMenu} className="py-2 hover:text-blue-500 transition">About</a>
              <a href="#portfolio" onClick={closeMobileMenu} className="py-2 hover:text-blue-500 transition">Portfolio</a>
              <a href="#contact" onClick={closeMobileMenu} className="py-2 hover:text-blue-500 transition">Contact</a>
              <a href="#feedback" onClick={closeMobileMenu} className="py-2 hover:text-blue-500 transition">Feedback</a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Basic CV Section */}
        <section id="home" className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                <img 
                  src="profile.jpg" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Shendy Pratama Solihin</h1>
              <h2 className="text-xl md:text-2xl text-blue-500 mb-4">Information System Student</h2>
              <p className="mb-4 text-sm md:text-base">
                Passionate about web development and design. Currently pursuing my Bachelor's degree 
                in Information System with a focus on front-end technologies and user experience.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Education</h3>
                  <p>B.Sc. Computer Science</p>
                  <p>Ma'soem University, 2020-2024</p>
                </div>
                <div>
                  <h3 className="font-semibold">Skills</h3>
                  <p>React, Next.js, Tailwind CSS</p>
                  <p>UI/UX Design, JavaScript</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Timeline Section */}
        <section id="portfolio" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">My Portfolio</h2>
          
          {!activeItem ? (
            <div className="relative">
              {/* Timeline line */}
              <div className={`absolute left-4 sm:left-1/2 h-full w-1 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} sm:transform sm:-translate-x-1/2`}></div>
              
              {/* Timeline items */}
              <div className="space-y-8 pl-8 sm:pl-0">
                {portfolioItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`relative`}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    <div 
                      className={`w-full p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                      onClick={() => setActiveItem(item)}
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} absolute left-0 sm:left-1/2 transform -translate-x-1/2`}></div>
                        <h3 className="text-xl font-bold ml-4">{item.title}</h3>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} mb-2`}>{item.date}</div>
                      <p className="mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-6 sm:p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <button 
                onClick={() => setActiveItem(null)}
                className={`px-4 py-2 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                ← Back to Portfolio
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{activeItem.title}</h2>
              <div className={`text-base sm:text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-4`}>{activeItem.date}</div>
              <p className="mb-6">{activeItem.fullDescription}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {activeItem.tags.map(tag => (
                  <span 
                    key={tag} 
                    className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-bold mb-2">Project Highlights</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Implemented modern design principles for better user experience</li>
                  <li>Collaborated with a team of 4 developers</li>
                  <li>Conducted user testing with 50+ participants</li>
                  <li>Improved performance metrics by 30%</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Get In Touch</h2>
          <div className={`max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block mb-1">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className={`px-6 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Feedback & Ratings</h2>
          
          {/* Rating Section */}
          <div className={`max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-xl font-semibold mb-2 sm:mb-0">Rate My Portfolio</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">{averageRating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${star <= (hoverRating || rating) ? 'text-yellow-400' : theme === 'dark' ? 'text-gray-500' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        submitRating(star);
                      }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  ({totalRatings} {totalRatings === 1 ? 'vote' : 'votes'})
                </span>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={submitComment} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
              <div className="mb-4">
                <label htmlFor="commenter-name" className="block mb-1">Your Name</label>
                <input
                  type="text"
                  id="commenter-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="comment-text" className="block mb-1">Your Comment</label>
                <textarea
                  id="comment-text"
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
              >
                Post Comment
              </button>
            </form>

            {/* Comments List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>
              {comments.length === 0 ? (
                <p className={`italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <h4 className="font-semibold">{comment.name}</h4>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(comment.timestamp?.toDate()).toLocaleString()}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="#" className="hover:text-blue-500 transition">LinkedIn</a>
            <a href="#" className="hover:text-blue-500 transition">GitHub</a>
            <a href="#" className="hover:text-blue-500 transition">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={`fixed bottom-4 left-4 p-3 rounded-full shadow-lg ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Chatbot - Responsive sizing */}
      <div className={`fixed bottom-4 right-4 transition-all duration-300 ${chatOpen ? 'w-full sm:w-80 h-96' : 'w-16 h-16'}`}
        style={{ maxWidth: chatOpen ? 'calc(100% - 2rem)' : 'none' }}>
        {chatOpen ? (
          <div className={`relative w-full h-full rounded-lg shadow-xl flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold">Portfolio Assistant</h3>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs p-3 rounded-lg ${message.role === 'user' 
                        ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <form onSubmit={handleChatSubmit} className="p-3 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className={`flex-1 p-2 rounded-l-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-r-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setChatOpen(true)}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-all`}
            aria-label="Open chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
