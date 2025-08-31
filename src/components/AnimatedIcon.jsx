'use client';
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedIcon = () => {
  return (
    <motion.div
      className="relative w-64 h-64"
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
    >
      <motion.div
        className="absolute w-16 h-16 bg-purple-400 rounded-full"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
      />
      <motion.div
        className="absolute w-8 h-8 bg-pink-500 rounded-full"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
        animate={{
          x: ['-50%', '-50%', '150%', '150%', '-50%'],
          y: ['-50%', '150%', '150%', '-50%', '-50%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />
      <motion.div
        className="absolute w-6 h-6 bg-teal-400 rounded-full"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
        animate={{
          x: ['-50%', '-50%', '-150%', '-150%', '-50%'],
          y: ['-50%', '-150%', '-150%', '-50%', '-50%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />
    </motion.div>
  );
};

export default AnimatedIcon;
