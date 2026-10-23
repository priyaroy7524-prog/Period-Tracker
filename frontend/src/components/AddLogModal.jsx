import React, { useState } from 'react';
import { X, Heart, Smile, AlertCircle } from 'lucide-react';

const AddLogModal = ({ isOpen, onClose, onSave, isDarkMode }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mood, setMood] = useState('Happy 🌸');
  const [symptoms, setSymptoms] = useState([]);

  const symptomList = ['Cramps ⚡', 'Acne ✨', 'Bloating 🎈', 'Fatigue 😴', 'Headache 🤕'];

  const toggleSymptom = (item) => {
    if (symptoms.includes(item)) {
      setSymptoms(symptoms.filter(s => s !== item));
    } else {
      setSymptoms([...symptoms, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ startDate, endDate, mood, symptoms });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl transition-all border ${
        isDarkMode ? 'bg-pastel-darkCard text-white border-purple-800/40' : 'bg-white text-gray-800 border-rose-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-pink-500">Log Period Dates 🩸</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-rose-100 dark:hover:bg-purple-900/40">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">Start Date</label>
            <input 
              type="date" 
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-pink-200 dark:border-purple-800 bg-pink-50/50 dark:bg-purple-950/30 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">End Date</label>
            <input 
              type="date" 
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-pink-200 dark:border-purple-800 bg-pink-50/50 dark:bg-purple-950/30 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 block">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {symptomList.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleSymptom(item)}
                  className={`text-xs px-3 py-2 rounded-full border transition-all ${
                    symptoms.includes(item)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent'
                      : 'border-pink-200 dark:border-purple-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:opacity-95 transition-all"
          >
            Save Cycle Log ✨
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLogModal;