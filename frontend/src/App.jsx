import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  ShoppingBag, 
  Sparkles, 
  X, 
  Droplets, 
  ArrowRight,
  User,
  Bell,
  ChevronLeft
} from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:5000/api/cycles';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('activities'); // 'activities', 'calendar', 'reports', 'settings'

  // Modals state
  const [showLogPeriodModal, setShowLogPeriodModal] = useState(false);
  const [showLogSymptomModal, setShowLogSymptomModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(null);

  // Cycle & Settings State
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  
  // Dynamic Dates (Defaulted to current month log)
  const [periodStartDate, setPeriodStartDate] = useState(() => {
    const today = new Date();
    // Default start date to 18 days ago so current cycle day is ~Day 19 by default, matching UI
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 18);
    return defaultStart.toISOString().split('T')[0];
  });
  
  const [periodEndDate, setPeriodEndDate] = useState(() => {
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() - 13);
    return defaultEnd.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastLoggedTime, setLastLoggedTime] = useState('10:30 AM');

  // Interactive Form States
  const [symptomLogSuccess, setSymptomLogSuccess] = useState(false);
  const [periodLogSuccess, setPeriodLogSuccess] = useState(false);
  const [loggedSymptoms, setLoggedSymptoms] = useState({
    flow: 'Medium',
    mood: 'Happy',
    symptoms: ['Mild Cramps'],
  });

  // Input states for modal forms
  const [inputStartDate, setInputStartDate] = useState('');
  const [inputEndDate, setInputEndDate] = useState('');

  // -------------------------------------------------------------
  // BACKEND INTEGRATION (FETCH & SAVE WITH LOCAL FALLBACK)
  // -------------------------------------------------------------
  const fetchCycleData = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0]; // Assuming array is sorted by date desc
          if (latest.startDate) setPeriodStartDate(latest.startDate);
          if (latest.endDate) setPeriodEndDate(latest.endDate);
          if (latest.cycleLength) setCycleLength(latest.cycleLength);
          if (latest.periodLength) setPeriodLength(latest.periodLength);
        }
      }
    } catch (err) {
      console.log('Backend not connected or offline. Using local state.', err);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, []);

  // Update input defaults when modal opens
  useEffect(() => {
    if (showLogPeriodModal) {
      setInputStartDate(periodStartDate);
      setInputEndDate(periodEndDate);
    }
  }, [showLogPeriodModal, periodStartDate, periodEndDate]);

  // -------------------------------------------------------------
  // DYNAMIC CYCLE CALCULATIONS
  // -------------------------------------------------------------
  const calculateCycleInfo = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(periodStartDate);
    start.setHours(0, 0, 0, 0);

    // Calculate Current Cycle Day
    const diffTime = today.getTime() - start.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Handle loop if past cycle length
    if (diffDays < 1) diffDays = 1;
    const currentCycleDay = ((diffDays - 1) % cycleLength) + 1;

    // Dynamic Ovulation Window (Days 13 to 17, Peak Day 14)
    const ovulStart = new Date(start);
    ovulStart.setDate(start.getDate() + 12); // Day 13

    const ovulEnd = new Date(start);
    ovulEnd.setDate(start.getDate() + 16); // Day 17

    // Dynamic Safe Days Range (Days 20 to 28)
    const safeStart = new Date(start);
    safeStart.setDate(start.getDate() + 19); // Day 20

    const safeEnd = new Date(start);
    safeEnd.setDate(start.getDate() + (cycleLength - 1)); // Day 28

    // Safe Days Left Countdown
    let safeDaysLeft = 0;
    if (currentCycleDay < 20) {
      safeDaysLeft = 20 - currentCycleDay;
    } else if (currentCycleDay <= cycleLength) {
      safeDaysLeft = cycleLength - currentCycleDay + 1;
    }

    // Helper Date Formatter (e.g. "Oct 19 - Oct 23")
    const formatDateShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const ovulationRangeText = `${formatDateShort(ovulStart)} - ${formatDateShort(ovulEnd)}`;
    const safeDaysRangeText = `${formatDateShort(safeStart)} - ${formatDateShort(safeEnd)}`;

    // Determine Cycle Phase & Subtitle
    let phaseName = 'Follicular Phase';
    let phaseSubtitle = 'Estrogen rising, energy increasing';

    if (currentCycleDay <= periodLength) {
      phaseName = `Period Day ${currentCycleDay}`;
      phaseSubtitle = 'Low energy, focus on hydration & rest';
    } else if (currentCycleDay >= 13 && currentCycleDay <= 17) {
      const ovDayNum = currentCycleDay - 12;
      phaseName = `Ovulation Day ${ovDayNum}`;
      phaseSubtitle = 'High chances of getting pregnant';
    } else if (currentCycleDay > 17) {
      phaseName = 'Luteal Phase';
      phaseSubtitle = 'Progesterone peak, prepare for period';
    }

    return {
      currentCycleDay,
      phaseName,
      phaseSubtitle,
      ovulationRangeText,
      safeDaysRangeText,
      safeDaysLeft
    };
  };

  const cycleInfo = calculateCycleInfo();

  // Dynamic Dial Badges Math
  // We center the dial around the current cycle day (displaying 13 days in the arc)
  const getDialDays = () => {
    const center = Math.max(7, Math.min(cycleLength - 6, cycleInfo.currentCycleDay));
    return Array.from({ length: 13 }, (_, i) => center - 6 + i);
  };

  const dialDays = getDialDays();

  // Articles Data
  const articles = [
    {
      id: 1,
      title: 'Never Menstruated',
      subtitle: 'Primary Amenorrhea Guide',
      category: 'Health Basics',
      tag: 'Medical Info',
      bg: '#FCE4EC',
      borderColor: '#F8BBD0',
      textColor: '#880E4F',
      badgeBg: '#F48FB1',
      badgeText: '#ffffff',
      content: 'Primary amenorrhea is defined as the absence of menses by age 15 or within 3 years of breast development. Common causes include hormonal fluctuations, genetic variations, structural differences, or intense physical stress. Consult a specialist for personal evaluations.'
    },
    {
      id: 2,
      title: 'Short Menstrual Delay',
      subtitle: 'Understanding 2-7 Day Variations',
      category: 'Cycle Shifts',
      tag: 'Common',
      bg: '#FFF3E0',
      borderColor: '#FFE0B2',
      textColor: '#E65100',
      badgeBg: '#FFB74D',
      badgeText: '#ffffff',
      content: 'Short delays (up to a week) are extremely normal and often caused by transient acute stress, sleep disruption, travel, illness, or minor diet shifts. Your hormonal system dynamically adjusts month-to-month.'
    },
    {
      id: 3,
      title: 'Significant Menstrual Delay',
      subtitle: 'When Delay Exceeds 10+ Days',
      category: 'Medical Insights',
      tag: 'Important',
      bg: '#EFEBE9',
      borderColor: '#D7CCC8',
      textColor: '#4E342E',
      badgeBg: '#A1887F',
      badgeText: '#ffffff',
      content: 'When a period is delayed by 10 days or longer, secondary amenorrhea or pregnancy could be potential factors. Thyroid changes, major weight changes, or elevated cortisol levels can impact rhythm.'
    }
  ];

  // Save Period Modal Action
  const handleSavePeriod = async (e) => {
    e.preventDefault();
    if (!inputStartDate) return;

    setPeriodStartDate(inputStartDate);
    if (inputEndDate) setPeriodEndDate(inputEndDate);

    const payload = {
      startDate: inputStartDate,
      endDate: inputEndDate || inputStartDate,
      cycleLength,
      periodLength,
      symptoms: loggedSymptoms
    };

    // Attempt backend save
    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log('Saved to local application state (Backend offline).', err);
    }

    setPeriodLogSuccess(true);
    setTimeout(() => {
      setPeriodLogSuccess(false);
      setShowLogPeriodModal(false);
    }, 1200);
  };

  // Save Symptoms Modal Action
  const handleSaveSymptoms = (e) => {
    e.preventDefault();
    const now = new Date();
    setLastLoggedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSymptomLogSuccess(true);
    setTimeout(() => {
      setSymptomLogSuccess(false);
      setShowLogSymptomModal(false);
    }, 1200);
  };

  return (
    <div 
      style={{
        backgroundColor: '#F3F4F6',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '80px',
        boxSizing: 'border-box'
      }}
    >
      {/* Mobile Frame Container */}
      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        {/* 1. TOP HEADER */}
        <header 
          style={{
            paddingTop: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #FFF5F7 0%, #FFFFFF 100%)'
          }}
        >
          {/* Logo / Shop button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FF2D55',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(255, 45, 85, 0.3)'
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px', display: 'block', lineHeight: '1' }}>
                Shop
              </span>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>
                Aura Essentials
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                cursor: 'pointer'
              }}
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* MAIN CONTAINER CONTENT */}
        <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>

          {/* TAB 1: ACTIVITIES (HOME UI) */}
          {activeTab === 'activities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* ARC DIAL TRACKER SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingTop: '10px' }}>
                
                {/* Arc SVG & Day Markers */}
                <div style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  
                  {/* SVG Arc Path */}
                  <svg viewBox="0 0 300 180" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="arcTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF2D55" />
                        <stop offset="35%" stopColor="#FFA000" />
                        <stop offset="60%" stopColor="#7C4DFF" />
                        <stop offset="85%" stopColor="#FFA000" />
                        <stop offset="100%" stopColor="#FF2D55" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc Shadow */}
                    <path
                      d="M 25 155 A 125 125 0 0 1 275 155"
                      fill="none"
                      stroke="#F3F4F6"
                      strokeWidth="24"
                      strokeLinecap="round"
                    />
                    {/* Main Arc Gradient Line */}
                    <path
                      d="M 25 155 A 125 125 0 0 1 275 155"
                      fill="none"
                      stroke="url(#arcTrackGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Dynamic Day Circle Badges along Arc */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {dialDays.map((day, index) => {
                      const total = dialDays.length;
                      // Angle from -165deg to -15deg across semicircle
                      const angleDeg = -165 + (index / (total - 1)) * 150;
                      const angleRad = (angleDeg * Math.PI) / 180;
                      const radius = 125;
                      const centerX = 150;
                      const centerY = 153;

                      const x = centerX + radius * Math.cos(angleRad);
                      const y = centerY + radius * Math.sin(angleRad);

                      const isHighlighted = day === cycleInfo.currentCycleDay;

                      return (
                        <div
                          key={day}
                          style={{
                            position: 'absolute',
                            left: `calc(${(x / 300) * 100}% - 12px)`,
                            top: `calc(${(y / 180) * 100}% - 12px)`,
                            width: isHighlighted ? '28px' : '22px',
                            height: isHighlighted ? '28px' : '22px',
                            borderRadius: '50%',
                            backgroundColor: isHighlighted ? '#7C4DFF' : '#FFD54F',
                            color: '#FFFFFF',
                            fontSize: isHighlighted ? '12px' : '10px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isHighlighted 
                              ? '0 0 0 4px #EDE7F6, 0 4px 8px rgba(124, 77, 255, 0.4)' 
                              : '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: isHighlighted ? 10 : 2,
                            transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  {/* Inner Arc Text Info (Dynamically Calculated) */}
                  <div style={{ position: 'absolute', top: '75px', left: 0, right: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      style={{
                        backgroundColor: '#F3E5F5',
                        color: '#7B1FA2',
                        fontSize: '10px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                      }}
                    >
                      Cycle Phase
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                      {cycleInfo.phaseName}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', margin: '4px 0 0 0', maxWidth: '200px' }}>
                      {cycleInfo.phaseSubtitle}
                    </p>
                  </div>

                </div>

                {/* Hot Pink Pill Button '+ Log Period' */}
                <button
                  onClick={() => setShowLogPeriodModal(true)}
                  style={{
                    backgroundColor: '#FF2D55',
                    background: 'linear-gradient(90deg, #FF2D55 0%, #E91E63 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '700',
                    padding: '12px 28px',
                    borderRadius: '30px',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(255, 45, 85, 0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '-5px',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  <Plus size={18} strokeWidth={3} />
                  Log Period
                </button>
              </div>

              {/* 2-COLUMN INFO GRID (DYNAMIC DATA INTEGRATED) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* 1. Green Card (Top Left) - Dynamic Safe Days */}
                <div 
                  style={{
                    backgroundColor: '#E8F5E9',
                    borderRadius: '24px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '135px',
                    border: '1px solid #C8E6C9'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#2E7D32' }}>
                        {cycleInfo.safeDaysLeft} Days left
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#4E342E', fontWeight: '600', display: 'block' }}>
                      Safe Days
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1B5E20', margin: '2px 0 0 0' }}>
                      {cycleInfo.safeDaysRangeText}
                    </h3>
                  </div>

                  <div style={{ borderTop: '1px solid #C8E6C9', paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#388E3C', fontWeight: '700' }}>
                      ● Low Pregnancy Risk
                    </span>
                  </div>
                </div>

                {/* 2. Peach/Orange Card (Top Right) - Dynamic Ovulation Cycle */}
                <div 
                  style={{
                    backgroundColor: '#FFF3E0',
                    borderRadius: '24px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '135px',
                    border: '1px solid #FFE0B2'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#EF6C00', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={13} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#E65100' }}>
                        Current Cycle
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#5D4037', fontWeight: '600', display: 'block' }}>
                      Ovulation Window
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#E65100', margin: '2px 0 0 0' }}>
                      {cycleInfo.ovulationRangeText}
                    </h3>
                  </div>

                  <div style={{ borderTop: '1px solid #FFE0B2', paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#F57C00', fontWeight: '700' }}>
                      ● Peak Fertile Window
                    </span>
                  </div>
                </div>

                {/* 3. Hot Pink Card (Bottom Left) - Last Logged */}
                <div 
                  style={{
                    backgroundColor: '#FF5252',
                    background: 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)',
                    borderRadius: '24px',
                    padding: '14px',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '145px',
                    boxShadow: '0 8px 16px rgba(255, 23, 68, 0.25)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#FFEBEE" />
                        <span style={{ fontSize: '11px', color: '#FFEBEE', fontWeight: '600' }}>
                          Last logged
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowLogSymptomModal(true)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          border: 'none',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0 0 0', letterSpacing: '0.5px' }}>
                      {lastLoggedTime}
                    </h2>
                    <p style={{ fontSize: '10px', color: '#FFEBEE', margin: '2px 0 0 0' }}>
                      Flow: {loggedSymptoms.flow} • {loggedSymptoms.mood}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLogSymptomModal(true)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#FF1744',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    Log Symptoms
                  </button>
                </div>

                {/* 4. Soft Lavender/Purple Card (Bottom Right) - About Today */}
                <div 
                  style={{
                    backgroundColor: '#C5CAE9',
                    borderRadius: '24px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '145px',
                    border: '1px solid #9FA8DA'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#283593" />
                        <span style={{ fontSize: '11px', color: '#283593', fontWeight: '700' }}>
                          About Today
                        </span>
                      </div>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3F51B5' }}></span>
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A237E', margin: '4px 0 0 0' }}>
                      {cycleInfo.phaseName}
                    </h3>
                    <p style={{ fontSize: '10px', color: '#303F9F', margin: '4px 0 0 0', lineHeight: '1.3' }}>
                      {cycleInfo.phaseSubtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowArticleModal(articles[1])}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#283593',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}
                  >
                    Read More
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>

              {/* HORIZONTAL CAROUSEL ARTICLES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', margin: 0 }}>
                    Cycle Insights & Reading
                  </h3>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>
                    Swipe →
                  </span>
                </div>

                {/* Horizontal Scrolling Wrapper */}
                <div 
                  style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollSnapType: 'x mandatory'
                  }}
                >
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setShowArticleModal(art)}
                      style={{
                        minWidth: '220px',
                        maxWidth: '220px',
                        backgroundColor: art.bg,
                        border: `1px solid ${art.borderColor}`,
                        borderRadius: '20px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        scrollSnapAlign: 'start',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div>
                        <span 
                          style={{
                            display: 'inline-block',
                            fontSize: '9px',
                            fontWeight: '800',
                            backgroundColor: art.badgeBg,
                            color: art.badgeText,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            marginBottom: '8px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {art.tag}
                        </span>
                        <h4 style={{ fontSize: '13px', fontWeight: '900', color: art.textColor, margin: 0, lineHeight: '1.3' }}>
                          {art.title}
                        </h4>
                        <p style={{ fontSize: '11px', color: '#616161', margin: '4px 0 0 0', lineHeight: '1.2' }}>
                          {art.subtitle}
                        </p>
                      </div>

                      <div style={{ marginTop: '14px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: art.textColor }}>Read guide</span>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: art.textColor }}>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#111827' }}>
                  {new Date(periodStartDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F3F4F6', border: 'none' }}><ChevronLeft size={16} /></button>
                  <button style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F3F4F6', border: 'none' }}><ChevronRight size={16} /></button>
                </div>
              </div>

              {/* Day Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                  <span key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF' }}>{d}</span>
                ))}
              </div>

              {/* Dynamic Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const startDayNum = new Date(periodStartDate).getDate();
                  let isPeriod = day >= startDayNum && day < startDayNum + periodLength;
                  let isOvulation = day >= startDayNum + 12 && day <= startDayNum + 16;
                  let isPeakOvulation = day === startDayNum + 13;

                  let bgColor = '#F9FAFB';
                  let textColor = '#374151';

                  if (isPeriod) {
                    bgColor = '#FF2D55';
                    textColor = '#FFFFFF';
                  } else if (isOvulation) {
                    bgColor = isPeakOvulation ? '#7C4DFF' : '#EDE7F6';
                    textColor = isPeakOvulation ? '#FFFFFF' : '#5E35B1';
                  }

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(`Selected: Day ${day}`)}
                      style={{
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: bgColor,
                        color: textColor,
                        fontSize: '12px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div style={{ backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Cycle Legend</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF2D55' }}></span>
                    <span>Period Flow</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C4DFF' }}></span>
                    <span>Ovulation Day</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFF0F2', padding: '16px', borderRadius: '20px', border: '1px solid #FFD6DC' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#111827', margin: 0 }}>Cycle Analytics</h3>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 12px 0' }}>Based on recent tracked cycles</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600' }}>Avg Cycle</span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#FF2D55', margin: '2px 0 0 0' }}>{cycleLength} Days</h4>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600' }}>Period Duration</span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#E91E63', margin: '2px 0 0 0' }}>{periodLength} Days</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFE4E6', color: '#FF2D55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#111827' }}>Cycle Profile</h3>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Adjust period parameters</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    <span>Cycle Length</span>
                    <span style={{ color: '#FF2D55' }}>{cycleLength} days</span>
                  </div>
                  <input 
                    type="range" 
                    min="21" 
                    max="35" 
                    value={cycleLength} 
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#FF2D55' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    <span>Period Length</span>
                    <span style={{ color: '#FF2D55' }}>{periodLength} days</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" 
                    max="8" 
                    value={periodLength} 
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#FF2D55' }}
                  />
                </div>
              </div>
            </div>
          )}

        </main>

        {/* 4. BOTTOM FIXED NAVIGATION BAR */}
        <nav 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F3F4F6',
            padding: '8px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30
          }}
        >
          {/* Activities */}
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'activities' ? '#FF2D55' : '#9CA3AF',
              position: 'relative'
            }}
          >
            <Activity size={20} strokeWidth={activeTab === 'activities' ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'activities' ? '800' : '600' }}>
              Activities
            </span>
            {activeTab === 'activities' && (
              <span style={{ position: 'absolute', bottom: '-4px', width: '16px', height: '3px', backgroundColor: '#FF2D55', borderRadius: '2px' }}></span>
            )}
          </button>

          {/* Calendar */}
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'calendar' ? '#FF2D55' : '#9CA3AF',
              position: 'relative'
            }}
          >
            <Calendar size={20} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'calendar' ? '800' : '600' }}>
              Calendar
            </span>
            {activeTab === 'calendar' && (
              <span style={{ position: 'absolute', bottom: '-4px', width: '16px', height: '3px', backgroundColor: '#FF2D55', borderRadius: '2px' }}></span>
            )}
          </button>

          {/* Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'reports' ? '#FF2D55' : '#9CA3AF',
              position: 'relative'
            }}
          >
            <BarChart3 size={20} strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'reports' ? '800' : '600' }}>
              Reports
            </span>
            {activeTab === 'reports' && (
              <span style={{ position: 'absolute', bottom: '-4px', width: '16px', height: '3px', backgroundColor: '#FF2D55', borderRadius: '2px' }}></span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'settings' ? '#FF2D55' : '#9CA3AF',
              position: 'relative'
            }}
          >
            <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'settings' ? '800' : '600' }}>
              Settings
            </span>
            {activeTab === 'settings' && (
              <span style={{ position: 'absolute', bottom: '-4px', width: '16px', height: '3px', backgroundColor: '#FF2D55', borderRadius: '2px' }}></span>
            )}
          </button>
        </nav>

        {/* ---------------- INTERACTIVE MODALS ---------------- */}

        {/* LOG PERIOD MODAL */}
        {showLogPeriodModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplets size={18} color="#FF2D55" />
                  Log Period Dates
                </h3>
                <button onClick={() => setShowLogPeriodModal(false)} style={{ border: 'none', backgroundColor: '#F3F4F6', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              {periodLogSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={40} color="#2E7D32" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontWeight: '800', margin: 0 }}>Period Saved!</p>
                </div>
              ) : (
                <form onSubmit={handleSavePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>Start Date</label>
                    <input 
                      type="date" 
                      value={inputStartDate}
                      onChange={(e) => setInputStartDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>End Date</label>
                    <input 
                      type="date" 
                      value={inputEndDate}
                      onChange={(e) => setInputEndDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#FF2D55', color: '#FFFFFF', padding: '12px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                    Confirm & Save
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* LOG SYMPTOMS MODAL */}
        {showLogSymptomModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={18} color="#FF2D55" />
                  Log Daily Symptoms
                </h3>
                <button onClick={() => setShowLogSymptomModal(false)} style={{ border: 'none', backgroundColor: '#F3F4F6', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              {symptomLogSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={40} color="#FF2D55" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontWeight: '800', margin: 0 }}>Symptoms Saved!</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSymptoms} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Flow Intensity</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Light', 'Medium', 'Heavy', 'None'].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setLoggedSymptoms({...loggedSymptoms, flow: f})}
                          style={{
                            padding: '8px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: loggedSymptoms.flow === f ? '#FF2D55' : '#F3F4F6',
                            color: loggedSymptoms.flow === f ? '#FFFFFF' : '#374151',
                            cursor: 'pointer'
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" style={{ backgroundColor: '#FF2D55', color: '#FFFFFF', padding: '12px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                    Save Log
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ARTICLE READ MODAL */}
        {showArticleModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: showArticleModal.badgeBg, color: showArticleModal.badgeText, padding: '4px 10px', borderRadius: '12px' }}>
                  {showArticleModal.tag}
                </span>
                <button onClick={() => setShowArticleModal(null)} style={{ border: 'none', backgroundColor: '#F3F4F6', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 4px 0' }}>
                {showArticleModal.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 14px 0' }}>
                {showArticleModal.subtitle}
              </p>

              <div style={{ backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '16px', fontSize: '12px', color: '#4B5563', lineHeight: '1.5', marginBottom: '16px' }}>
                {showArticleModal.content}
              </div>

              <button
                onClick={() => setShowArticleModal(null)}
                style={{ width: '100%', backgroundColor: '#111827', color: '#FFFFFF', padding: '12px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}
              >
                Close Article
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}