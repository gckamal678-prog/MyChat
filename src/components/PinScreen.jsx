import React, { useState } from 'react';
import { Delete, Lock } from 'lucide-react';

export default function PinScreen({ onPinVerified }) {
  const [pin, setPin] = useState('');

  const handlePress = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => onPinVerified(newPin), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-indigo-600/20 p-4 rounded-2xl text-indigo-400 mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Enter 6-Digit PIN</h2>
      <p className="text-xs text-slate-400 mb-6">Enter your security backup PIN</p>

      {/* Pin Dots */}
      <div className="flex space-x-3 mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 border-indigo-500 transition-all ${
              i < pin.length ? 'bg-indigo-500' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Custom Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 py-4 rounded-2xl text-xl font-semibold transition"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress('0')}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 py-4 rounded-2xl text-xl font-semibold transition"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center py-4 rounded-2xl text-xl font-semibold transition"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
