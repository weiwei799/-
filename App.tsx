import React, { useState } from 'react';
import Scene from './components/Scene';
import GestureController from './components/GestureController';
import { TreeState } from './types';

const App: React.FC = () => {
  const [hasEnteredKey, setHasEnteredKey] = useState<boolean>(false);
  
  // App State
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [targetCameraPos, setTargetCameraPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  const handleStart = () => {
    setHasEnteredKey(true);
  };

  if (!hasEnteredKey) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900 to-black p-8 text-center relative overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
             <div key={i} className="absolute bg-[#D4AF37] rounded-full" 
               style={{
                 width: Math.random() * 4 + 'px',
                 height: Math.random() * 4 + 'px',
                 top: Math.random() * 100 + '%',
                 left: Math.random() * 100 + '%',
                 animation: `pulse ${Math.random() * 3 + 2}s infinite`
               }}
             />
          ))}
        </div>

        <div className="z-10 max-w-lg w-full backdrop-blur-sm bg-black/40 border border-[#D4AF37]/50 p-10 rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.2)]">
          <h1 className="text-5xl md:text-6xl font-serif font-bold gold-gradient-text mb-4 tracking-tight drop-shadow-lg">
            Grand Luxury
          </h1>
          <h2 className="text-2xl font-serif text-emerald-100 mb-8 italic">
            Interactive Christmas Tree
          </h2>
          
          <p className="text-gray-300 mb-6 font-sans leading-relaxed text-sm">
            Experience the chaotic beauty of the season. 
            Use your camera to command the tree. 
            <br/><br/>
            <span className="text-[#D4AF37]">Open Hand</span> to unleash chaos.<br/>
            <span className="text-[#D4AF37]">Close Hand</span> to restore order.
          </p>

          <div className="space-y-4">
            <button 
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-[#b8860b] to-[#daa520] hover:from-[#d4af37] hover:to-[#ffd700] text-black font-bold py-3 px-8 rounded transform transition-all hover:scale-105 hover:shadow-[0_0_20px_#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              Enter The Lobby
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Requires Camera Permission • Powered by Gemini Flash 2.5
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-black">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none z-10">
        <div className="pointer-events-auto">
          <GestureController 
            onStateChange={setTreeState} 
            onCameraMove={setTargetCameraPos}
          />
        </div>
        
        <div className="text-right">
           <h1 className="text-3xl font-serif font-bold gold-gradient-text drop-shadow-md">
             GRAND LUXURY
           </h1>
           <p className="text-emerald-400 text-sm font-mono tracking-widest">
             STATUS: {treeState === TreeState.CHAOS ? 'UNLEASHED' : 'FORMED'}
           </p>
        </div>
      </div>

      {/* 3D Scene */}
      <Scene treeState={treeState} targetCameraPos={targetCameraPos} />
      
      {/* Bottom Vignette/Footer */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none flex items-end justify-center pb-4">
        <span className="text-[#555] text-[10px] font-mono">
           INTERACTIVE 3D EXPERIENCE • REACT THREE FIBER • GOOGLE GEMINI
        </span>
      </div>
    </div>
  );
};

export default App;