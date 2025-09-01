import { motion } from 'framer-motion';

const LoadingIndicator = () => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    start: {
      y: '0%',
    },
    end: {
      y: '100%',
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <div className="flex items-start gap-3 my-4 justify-start">
      <motion.div
        className="flex justify-center items-center gap-1.5 h-6"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        <motion.span
          className="block w-2.5 h-2.5 bg-gray-400 rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="block w-2.5 h-2.5 bg-gray-400 rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="block w-2.5 h-2.5 bg-gray-400 rounded-full"
          variants={dotVariants}
          transition={dotTransition}
        />
      </motion.div>
    </div>
  );
};

export default LoadingIndicator;
