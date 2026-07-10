import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Languages,
  Info,
  RefreshCw
} from 'lucide-react';

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! I am your Smart Bharat AI Civic Companion. I can help explain public schemes, check service steps, and direct you to civic utilities in Hindi, English, and other regional languages. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clean up Speech Synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Web Speech Recognition (Voice Typing) Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Attempt to match selected language locale
      const langLocales = {
        "English": "en-IN",
        "Hindi": "hi-IN",
        "Bengali": "bn-IN",
        "Tamil": "ta-IN",
        "Telugu": "te-IN"
      };
      rec.lang = langLocales[selectedLanguage] || "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputText(prev => prev + (prev ? " " : "") + transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      recognitionRef.current.start();
    }
  };

  // Text to Speech Function
  const speakMessage = (text, index) => {
    if (!window.speechSynthesis) {
      alert("Text to speech is not supported in your browser.");
      return;
    }

    if (isSpeaking && speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean up markdown tags from speech synthesis
    const cleanedText = text
      .replace(/\*\*+/g, "")
      .replace(/\*+/g, "- ")
      .replace(/#+/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    // Choose appropriate voice or accent based on language
    const voices = window.speechSynthesis.getVoices();
    if (selectedLanguage === "Hindi") {
      const hindiVoice = voices.find(v => v.lang.includes("hi"));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const indianEngVoice = voices.find(v => v.lang.includes("en-IN") || v.name.includes("India"));
      if (indianEngVoice) utterance.voice = indianEngVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };

    setSpeakingMsgIndex(index);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch('https://smart-bharat-civic-companion-rk6z.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          language: selectedLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error("Failed to receive response");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Apologies, I encountered an issue connecting to the core server. Please check that the server is active, or try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        sender: 'bot',
        text: "Chat cleared. Ask me about Aadhaar updates, Ration Cards, Passports, or PM schemes in your preferred language.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Predefined prompt helper
  const promptPills = [
    "How to apply for Ration Card?",
    "What is Ayushman Bharat Yojana?",
    "What documents are needed for Passport?",
    "How do I link PAN with Aadhaar?"
  ];

  const handlePillClick = (pillText) => {
    handleSendMessage(pillText);
  };

  const renderMarkdownText = (text) => {
    // Simple regex replacement for bold and bullets for safe UI rendering
    return text.split('\n').map((line, i) => {
      let content = line;
      let isBullet = false;

      // Handle bullets
      if (content.startsWith('* ') || content.startsWith('- ')) {
        isBullet = true;
        content = content.substring(2);
      }

      // Handle Bold **text**
      const parts = content.split('**');
      const formattedParts = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} style={{ color: 'var(--text-primary)' }}>{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={i} style={{ marginLeft: '1.2rem', marginBottom: '0.4rem', listStyleType: 'disc' }}>
            {formattedParts}
          </li>
        );
      }

      return <p key={i} style={{ marginBottom: '0.65rem' }}>{formattedParts}</p>;
    });
  };

  return (
    <div className="page-container">
      {/* Header Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Smart Bharat AI <Sparkles size={24} style={{ color: 'var(--accent-saffron)' }} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Your multilingual gateway to Indian public schemes, utility forms, and civic policies.
          </p>
        </div>

        {/* Toolbar controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <Languages size={16} style={{ color: 'var(--accent-ashoka)' }} />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
            </select>
          </div>

          <button
            onClick={clearChat}
            className="btn btn-secondary btn-icon"
            title="Clear Chat"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="glass-card chat-window">
        {/* Chat Message Window */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message-bubble ${msg.sender === 'bot' ? 'message-bot' : 'message-user'}`}
              style={{ position: 'relative', paddingRight: msg.sender === 'bot' ? '3rem' : '1.25rem' }}
            >
              {/* TTS icon inside bot bubble */}
              {msg.sender === 'bot' && (
                <button
                  onClick={() => speakMessage(msg.text, index)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: speakingMsgIndex === index ? 'var(--accent-saffron)' : 'var(--text-muted)',
                    padding: '0.25rem',
                    transition: 'color 0.2s'
                  }}
                  title={speakingMsgIndex === index ? "Stop voice reading" : "Read message aloud"}
                >
                  {speakingMsgIndex === index ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              )}

              {/* Message Content */}
              <div>
                {msg.sender === 'bot' ? renderMarkdownText(msg.text) : <p>{msg.text}</p>}
              </div>

              {/* Timestamp */}
              <span style={{
                display: 'block',
                fontSize: '0.65rem',
                textAlign: 'right',
                marginTop: '0.5rem',
                color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
              }}>
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message-bubble message-bot" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', padding: '0.75rem 1rem' }}>
              <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'slideUp 0.6s infinite alternate' }} />
              <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'slideUp 0.6s infinite alternate 0.2s' }} />
              <div className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'slideUp 0.6s infinite alternate 0.4s' }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Recommendation Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          margin: '0.75rem 0',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none'
        }}>
          {promptPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handlePillClick(pill)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              className="pill-hover"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="chat-input-area"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`btn btn-secondary btn-icon ${isListening ? 'listening-active' : ''}`}
            style={{
              borderColor: isListening ? 'var(--accent-danger)' : 'var(--border-color)',
              color: isListening ? 'white' : 'var(--text-secondary)',
              backgroundColor: isListening ? 'var(--accent-danger)' : 'var(--bg-secondary)',
              boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
            }}
            title={isListening ? "Listening... click to stop" : "Speak query (Voice-to-Text)"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your civic query here... (e.g. Apply for Ration Card)"}
            className="form-input"
            style={{ borderRadius: 'var(--radius-md)', height: '46px' }}
            disabled={isListening}
          />

          <button
            type="submit"
            className="btn btn-primary btn-icon"
            style={{ height: '46px', width: '46px' }}
            disabled={!inputText.trim()}
          >
            <Send size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}>
          <Info size={12} />
          <span>Responses are generated using Google Gemini AI and cross-checked against standard government guides.</span>
        </div>
      </div>
    </div>
  );
}
