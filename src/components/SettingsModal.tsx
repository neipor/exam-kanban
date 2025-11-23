import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ExamScheduleItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSchedule: ExamScheduleItem[]; // Added prop
  onSaveSchedule: (schedule: ExamScheduleItem[]) => void; // Added prop
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, examSchedule, onSaveSchedule }) => {
  const [newSubject, setNewSubject] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('');
  const [newEndTime, setNewEndTime] = useState<string>('');
  const [currentSchedule, setCurrentSchedule] = useState<ExamScheduleItem[]>(examSchedule); // Local state for schedule

  // Keep local schedule in sync with prop, but allow local modifications
  useEffect(() => {
    setCurrentSchedule(examSchedule);
  }, [examSchedule]);

  const handleAddExam = () => {
    if (newSubject && newStartTime && newEndTime) {
      const newExam: ExamScheduleItem = {
        id: Date.now().toString(), // Simple unique ID
        subject: newSubject,
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
      };
      const updatedSchedule = [...currentSchedule, newExam];
      setCurrentSchedule(updatedSchedule);
      onSaveSchedule(updatedSchedule); // Save to parent/persistent storage
      // Clear form
      setNewSubject('');
      setNewStartTime('');
      setNewEndTime('');
    }
  };

  const handleDeleteExam = (id: string) => {
    const updatedSchedule = currentSchedule.filter(exam => exam.id !== id);
    setCurrentSchedule(updatedSchedule);
    onSaveSchedule(updatedSchedule); // Save to parent/persistent storage
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            // Basic validation and conversion
            const importedSchedule: ExamScheduleItem[] = parsed.map((item: any) => ({
              id: item.id || Date.now().toString() + Math.random(),
              subject: item.subject || 'Untitled',
              startTime: new Date(item.startTime),
              endTime: new Date(item.endTime),
            }));
            setCurrentSchedule(importedSchedule);
            onSaveSchedule(importedSchedule);
            alert('Schedule imported successfully!');
          } else {
            alert('Invalid file format: Expected an array of exams.');
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]" // Added max-h and overflow
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Settings</h2>

            {/* Import Schedule Section */}
            <div className="mb-8 p-4 border border-gray-700 rounded-md bg-gray-700/30">
              <h3 className="text-xl font-semibold mb-4">Import Schedule</h3>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Upload a JSON file containing an array of exam objects.</p>
            </div>

            {/* Add New Exam Form */}
            <div className="mb-8 p-4 border border-gray-700 rounded-md">
              <h3 className="text-xl font-semibold mb-4">Add New Exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject (e.g., Math)"
                  className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
                <button
                  onClick={handleAddExam}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-lg font-semibold transition-colors col-span-full md:col-span-1"
                >
                  Add Exam
                </button>
              </div>
            </div>

            {/* Existing Schedule List */}
            <div className="p-4 border border-gray-700 rounded-md">
              <h3 className="text-xl font-semibold mb-4">Current Schedule</h3>
              {currentSchedule.length === 0 ? (
                <p className="text-center text-gray-400">No exams scheduled.</p>
              ) : (
                <ul>
                  {currentSchedule
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) // Sort by start time
                    .map((exam) => (
                    <li key={exam.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 mb-2 bg-gray-700 rounded-md">
                      <div>
                        <p className="text-lg font-semibold">{exam.subject}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex mt-2 md:mt-0 space-x-2">
                        {/* <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm transition-colors">Edit</button> */}
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8 text-right">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
