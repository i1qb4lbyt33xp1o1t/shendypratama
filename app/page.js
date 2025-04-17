'use client'

import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import {
  Sun, Moon, Menu, ArrowLeft
} from 'lucide-react'
import {
  FaUser, FaGraduationCap, FaTools, FaComments, FaFolderOpen,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaCode, FaServer, 
  FaPalette, FaMobileAlt
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCRzcBBK1LhhiVr4wy8zWV3dM2my_nBpq8",
  authDomain: "utsss-63fbf.firebaseapp.com",
  projectId: "utsss-63fbf",
  storageBucket: "utsss-63fbf.firebasestorage.app",
  messagingSenderId: "240542266582",
  appId: "1:240542266582:web:0aed6b2306a99c694b0577"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function Home() {
  const [theme, setTheme] = useState('light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState([])
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)
  const [portfolio] = useState([
    { 
      id: 1,
      title: 'Aplikasi Kasir', 
      desc: 'POS berbasis Web dengan Next.js',
      year: '2023',
      icon: <FaCode className="text-blue-500" />,
      details: {
        technologies: ['Next.js', 'Tailwind CSS', 'Firebase', 'Node.js'],
        features: ['Transaksi penjualan', 'Manajemen produk', 'Laporan harian', 'Multi-user'],
        challenges: 'Mengoptimalkan performa untuk transaksi cepat dan support offline',
        solution: 'Menggunakan SWR untuk data fetching, IndexedDB untuk offline support, dan Web Workers untuk proses berat',
        images: [
          '/portfolio/cashier-1.jpg',
          '/portfolio/cashier-2.jpg',
          '/portfolio/cashier-3.jpg'
        ],
        link: 'https://example.com/cashier'
      }
    },
    { 
      id: 2,
      title: 'Landing Page Produk', 
      desc: 'Next.js + Tailwind',
      year: '2022',
      icon: <FaPalette className="text-purple-500" />,
      details: {
        technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
        features: ['Animasi interaktif', 'Responsive design', 'Form kontak', 'Analytics'],
        challenges: 'Membuat animasi yang smooth tanpa mengurangi performa',
        solution: 'Menggunakan Framer Motion dengan optimasi Lazy Loading dan Intersection Observer',
        images: [
          '/portfolio/landing-1.jpg',
          '/portfolio/landing-2.jpg'
        ],
        link: 'https://example.com/landing'
      }
    },
    { 
      id: 3,
      title: 'Sistem Inventaris', 
      desc: 'Manajemen stok gudang',
      year: '2021',
      icon: <FaServer className="text-green-500" />,
      details: {
        technologies: ['React', 'Express.js', 'MongoDB', 'Redux'],
        features: ['Tracking stok', 'Notifikasi low stock', 'Multi-gudang', 'Barcode support'],
        challenges: 'Sinkronisasi data real-time antar banyak gudang',
        solution: 'Menggunakan WebSockets untuk update real-time dan MongoDB Change Streams',
        images: [
          '/portfolio/inventory-1.jpg',
          '/portfolio/inventory-2.jpg',
          '/portfolio/inventory-3.jpg'
        ],
        link: 'https://example.com/inventory'
      }
    },
    {
      id: 4,
      title: 'Aplikasi Mobile E-Commerce',
      desc: 'React Native E-Commerce App',
      year: '2023',
      icon: <FaMobileAlt className="text-red-500" />,
      details: {
        technologies: ['React Native', 'Firebase', 'Redux Toolkit'],
        features: ['Produk & kategori', 'Keranjang belanja', 'Checkout', 'Riwayat transaksi'],
        challenges: 'Performance pada device low-end dan UX yang smooth',
        solution: 'Menggunakan FlatList optimasi, memoization, dan code splitting',
        images: [
          '/portfolio/mobile-1.jpg',
          '/portfolio/mobile-2.jpg'
        ],
        link: 'https://example.com/mobile-app'
      }
    }
  ])

  const handleThemeToggle = () => setTheme(theme === 'light' ? 'dark' : 'light')

  const handleSubmit = async () => {
    if (!comment) return
    await addDoc(collection(db, 'comments'), {
      text: comment,
      rating: parseInt(rating),
      timestamp: new Date(),
    })
    setComment('')
    setRating(0)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data())
      setComments(data)
      setTotalRatings(data.map((d) => d.rating))
    })
    return () => unsubscribe()
  }, [])

  const averageRating =
    totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length || 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 relative">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 py-3 bg-gray-200 dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="text-xl font-bold">CV Online</div>
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu /></button>
        </div>
        <ul className="hidden md:flex gap-6 font-medium">
          <li><a href="#about"><FaUser /> Tentang</a></li>
          <li><a href="#portfolio"><FaFolderOpen /> Portfolio</a></li>
          <li><a href="#education"><FaGraduationCap /> Pendidikan</a></li>
          <li><a href="#skills"><FaTools /> Keahlian</a></li>
          <li><a href="#comment"><FaComments /> Komentar</a></li>
        </ul>
      </nav>

      {mobileMenuOpen && (
        <ul className="md:hidden flex flex-col px-4 py-2 gap-2 bg-gray-100 dark:bg-gray-700 font-medium">
          <li><a href="#about"><FaUser /> Tentang</a></li>
          <li><a href="#portfolio"><FaFolderOpen /> Portfolio</a></li>
          <li><a href="#education"><FaGraduationCap /> Pendidikan</a></li>
          <li><a href="#skills"><FaTools /> Keahlian</a></li>
          <li><a href="#comment"><FaComments /> Komentar</a></li>
        </ul>
      )}

      <button
        onClick={handleThemeToggle}
        className="fixed bottom-4 left-4 bg-gray-300 dark:bg-gray-700 p-2 rounded-full z-50"
      >
        {theme === 'light' ? <Moon /> : <Sun />}
      </button>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Biodata */}
        <section id="about" className="mb-12 text-center">
          <img src="/profile.jpg" alt="profile" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500" />
          <h1 className="text-3xl font-bold">Shendy Pratama Sholihin</h1>
          <p className="text-gray-600 dark:text-gray-300">Fullstack Developer | UI/UX | Freelancer</p>
          <div className="mt-4 space-y-1 text-sm text-left max-w-sm mx-auto">
            <p><FaEnvelope /> shendy@gmail.com</p>
            <p><FaPhone /> 0813435454</p>
            <p><FaMapMarkerAlt /> Jl. Contoh No. 123, Kota</p>
            <p><FaLinkedin /><a href="https://linkedin.com" className="text-blue-500 underline">LinkedIn</a></p>
          </div>
        </section>

        {/* Pendidikan */}
        <section id="education" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4"><FaGraduationCap /> Pendidikan</h2>
          <p><strong>Universitas Ma'soem</strong> - S1 Teknik Informatika (2019 - 2023)</p>
          <p><strong>SMK Negeri XYZ</strong> - RPL (2016 - 2019)</p>
        </section>

        {/* Skills */}
        <section id="skills" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4"><FaTools /> Keahlian</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 list-disc list-inside">
            <li>HTML, CSS, JS</li>
            <li>React & Next.js</li>
            <li>TailwindCSS</li>
            <li>Node.js & Express</li>
            <li>MongoDB & Firebase</li>
            <li>UI/UX Design</li>
          </ul>
        </section>

        {/* Portfolio */}
        <section id="portfolio" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6"><FaFolderOpen /> Portfolio</h2>
          
          <AnimatePresence>
            {selectedPortfolio ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6"
              >
                <button 
                  onClick={() => setSelectedPortfolio(null)}
                  className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400"
                >
                  <ArrowLeft size={18} /> Kembali ke Portfolio
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl">
                    {portfolio.find(p => p.id === selectedPortfolio).icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{portfolio.find(p => p.id === selectedPortfolio).title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{portfolio.find(p => p.id === selectedPortfolio).desc}</p>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                      {portfolio.find(p => p.id === selectedPortfolio).year}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Teknologi yang Digunakan</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {portfolio.find(p => p.id === selectedPortfolio).details.technologies.map((tech, i) => (
                        <span key={i} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-xl font-semibold mb-3">Fitur Utama</h4>
                    <ul className="list-disc pl-5 space-y-1 mb-6">
                      {portfolio.find(p => p.id === selectedPortfolio).details.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>

                    <h4 className="text-xl font-semibold mb-3">Tantangan</h4>
                    <p className="mb-6">{portfolio.find(p => p.id === selectedPortfolio).details.challenges}</p>

                    <h4 className="text-xl font-semibold mb-3">Solusi</h4>
                    <p className="mb-6">{portfolio.find(p => p.id === selectedPortfolio).details.solution}</p>

                    {portfolio.find(p => p.id === selectedPortfolio).details.link && (
                      <a 
                        href={portfolio.find(p => p.id === selectedPortfolio).details.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Kunjungi Projek
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-3">Screenshots</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {portfolio.find(p => p.id === selectedPortfolio).details.images.map((img, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <img 
                            src={img} 
                            alt={`Screenshot ${i+1}`} 
                            className="w-full h-auto object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>

                <div className="space-y-8">
                  {portfolio.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-blue-500 -translate-x-1/2 z-10"></div>

                      {/* Year marker */}
                      <div className={`hidden md:block absolute top-0 ${index % 2 === 0 ? 'md:left-1/2 md:translate-x-8' : 'md:right-1/2 md:-translate-x-8'} text-gray-500 font-medium`}>
                        {item.year}
                      </div>

                      {/* Card */}
                      <div 
                        onClick={() => setSelectedPortfolio(item.id)}
                        className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'} p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl mt-1">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.details.technologies.slice(0, 3).map((tech, i) => (
                                <span key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                  {tech}
                                </span>
                              ))}
                              {item.details.technologies.length > 3 && (
                                <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                  +{item.details.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                          Klik untuk detail →
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Komentar & Rating */}
        <section id="comment" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4"><FaComments /> Komentar & Rating</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-800"
          />
          <div className="flex items-center mt-2 gap-2">
            <span>Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button 
                key={n} 
                onClick={() => setRating(n)} 
                className={`text-xl ${n <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
              >
                ★
              </button>
            ))}
          </div>
          <button 
            onClick={handleSubmit} 
            className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Submit
          </button>
          <p className="text-sm mt-2">Rating {averageRating.toFixed(1)} dari {totalRatings.length} voters</p>
          <div className="space-y-2 mt-4">
            {comments.map((c, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border p-2 rounded bg-gray-100 dark:bg-gray-800"
              >
                <p className="italic">{c.text}</p>
                <p className="text-yellow-400">{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Chatbot AI */}
      <Chatbot />
    </div>
  )
}

// Chatbot Component Inline
function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = { sender: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      const botMessage = { sender: 'bot', text: data.response }
      setMessages((prev) => [...prev, botMessage])
    } catch (e) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Gagal menghubungi AI.' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-xl rounded-lg w-80 max-h-[70vh] flex flex-col overflow-hidden z-50 border">
      <div className="bg-blue-600 text-white text-center py-2 font-bold">🤖 AI Chatbot</div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-2 rounded ${msg.sender === 'user' ? 'bg-blue-100 dark:bg-blue-700 text-right ml-8' : 'bg-gray-200 dark:bg-gray-700 text-left mr-8'}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="italic text-gray-500">Mengetik...</div>}
      </div>
      <div className="flex border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Tanya AI..."
          className="flex-1 px-2 py-1 bg-transparent outline-none text-black dark:text-white"
        />
        <button 
          onClick={sendMessage} 
          className="px-3 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition"
        >
          Kirim
        </button>
      </div>
    </div>
  )
}