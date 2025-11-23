import React from 'react';

interface PlaygroundControlProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  simulatedTime: Date;
  onTimeChange: (time: Date) => void;
}

const PlaygroundControl: React.FC<PlaygroundControlProps> = ({
  isEnabled,
  onToggle,
  simulatedTime,
  onTimeChange,
}) => {
  // Calculate total minutes in a day for the slider
  const totalMinutes = 24 * 60;
  
  // Convert current simulated time to minutes from start of day
  const currentMinutes = simulatedTime.getHours() * 60 + simulatedTime.getMinutes();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    const newTime = new Date(simulatedTime);
    newTime.setHours(Math.floor(minutes / 60));
    newTime.setMinutes(minutes % 60);
    newTime.setSeconds(0); // Reset seconds for cleaner control
    onTimeChange(newTime);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 text-white w-80 opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Playground Mode</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>00:00</span>
            <span className="font-mono text-yellow-400 font-bold">{simulatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>23:59</span>
          </div>
          <input
            type="range"
            min="0"
            max={totalMinutes - 1}
            value={currentMinutes}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-gray-500 text-center mt-2">Drag slider to simulate time travel</p>
        </div>
      )}
    </div>
  );
};

export default PlaygroundControl;
