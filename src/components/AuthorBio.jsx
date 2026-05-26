import React from 'react';

export default function AuthorBio({ name, role, image, bio }) {
  return (
    <div className="relative mt-16 mb-8 max-w-4xl mx-auto group">
      {/* Animated glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Main card */}
      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 p-8 md:p-10 rounded-3xl bg-gray-900/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Subtle inner top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Avatar/Image container */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-50"></div>
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-purple-400 to-pink-400">
            <div className="w-full h-full rounded-full bg-[#0a0a0f] p-4 flex items-center justify-center overflow-hidden">
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center md:text-left flex-1 pt-2">
          <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase">
            {role}
          </div>
          <h4 className="text-3xl font-extrabold text-white mb-4 tracking-tight">{name}</h4>
          <p className="text-gray-300 leading-relaxed text-lg font-light">
            {bio}
          </p>
        </div>
      </div>
    </div>
  );
}
