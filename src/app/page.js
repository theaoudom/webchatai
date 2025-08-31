'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronRight,
  FiChevronLeft,
  FiZap,
  FiStar,
  FiClock,
  FiPlayCircle,
  FiMessageSquare,
  FiRepeat,
} from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';
import { homeData } from '../data/home';
import Footer from '../components/Footer';
import AnimatedIcon from '../components/AnimatedIcon';
import Header from '../components/Header';

const icons = {
  FiZap,
  FiStar,
  FiClock,
  FiPlayCircle,
  FiMessageSquare,
  FiRepeat,
};

const Home = () => {
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(true);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderTransparent(entry.isIntersecting);
      },
      {
        rootMargin: '0px 0px -90% 0px',
      }
    );

    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }

    return () => {
      if (heroSectionRef.current) {
        observer.unobserve(heroSectionRef.current);
      }
    };
  }, []);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const handleNextTestimonial = () => {
    setTestimonialIndex((prevIndex) =>
      prevIndex === homeData.testimonials.items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? homeData.testimonials.items.length - 1 : prevIndex - 1
    );
  };

  const handleDotClick = (index) => {
    setTestimonialIndex(index);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="bg-gray-900 text-white">
      <Header isTransparent={isHeaderTransparent} />
      <motion.section
        ref={heroSectionRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
      >
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, #4c1d95, transparent), radial-gradient(circle at 10% 20%, #be185d, transparent), radial-gradient(circle at 90% 80%, #1d4ed8, transparent)',
            backgroundSize: '200% 200%, 150% 150%, 150% 150%',
            animation: 'aurora 20s infinite linear',
          }}
        ></div>

        <div className="absolute inset-0 bg-black/30"></div>

        <motion.div
          className="relative z-10 w-full max-w-6xl mx-auto px-4"
          variants={sectionVariants}
        >
          <div className="relative p-8 border border-white/20 rounded-3xl bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 text-center md:text-left">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 leading-tight">
                  {homeData.mainHeading}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-lg">
                  {homeData.subHeading}
                </p>
                <p className="mt-4 text-lg text-gray-300 max-w-lg">
                  {homeData.heroParagraph}
                </p>
                <a
                  href="/chat"
                  className="mt-8 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  {homeData.callToAction}
                  <FiChevronRight className="ml-2" />
          </a>
        </div>
              <div className="md:w-1/2 flex justify-center mt-12 md:mt-0">
                <AnimatedIcon />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <div
        className="relative z-10 bg-[#0a0a0f] py-24 px-4"
      >
        <motion.section
          className="w-full max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            {homeData.features.heading}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {homeData.features.items.map((feature, index) => {
              const Icon = icons[feature.icon];
              return (
                <motion.div
                  key={index}
                  className="p-6 bg-gray-800 rounded-lg"
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: (i) => ({
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.2,
                        duration: 0.8,
                        ease: 'easeOut',
                      },
                    }),
                  }}
                >
                  <Icon className="h-8 w-8 text-purple-400 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="w-full max-w-4xl mx-auto mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            {homeData.howItWorks.heading}
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {homeData.howItWorks.steps.map((step, index) => {
              const Icon = icons[step.icon];
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: (i) => ({
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.2,
                        duration: 0.8,
                        ease: 'easeOut',
                      },
                    }),
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="h-12 w-12 text-purple-400" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="w-full max-w-4xl mx-auto mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            {homeData.testimonials.heading}
          </h3>
          <div className="w-full max-w-3xl mx-auto relative">
            <div className="overflow-hidden relative h-80 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  className="w-full absolute"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="p-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <div className="bg-gray-900 rounded-md p-8 md:p-12">
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="md:w-1/4 order-1 md:order-2 flex flex-col items-center">
                          <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                            {
                              homeData.testimonials.items[testimonialIndex]
                                .avatar
                            }
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white text-lg">
                              {
                                homeData.testimonials.items[testimonialIndex]
                                  .author
                              }
                            </p>
                            <p className="text-gray-500">
                              {
                                homeData.testimonials.items[testimonialIndex]
                                  .title
                              }
                            </p>
                          </div>
                        </div>
                        <div className="md:w-3/4 order-2 md:order-1 text-center md:text-left">
                          <p className="text-gray-300 text-xl italic leading-relaxed">
                            "
                            {
                              homeData.testimonials.items[testimonialIndex]
                                .quote
                            }
                            "
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={handlePrevTestimonial}
              className="absolute top-1/2 -left-4 md:-left-16 transform -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextTestimonial}
              className="absolute top-1/2 -right-4 md:-right-16 transform -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="flex justify-center mt-8 space-x-2">
            {homeData.testimonials.items.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  testimonialIndex === index ? 'bg-purple-500' : 'bg-gray-600'
                } hover:bg-purple-400`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="w-full max-w-4xl mx-auto mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="relative p-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <div className="bg-gray-900 rounded-md p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    {homeData.finalCTA.heading}
                  </h3>
                  <p className="text-gray-400 max-w-2xl">
                    {homeData.finalCTA.subHeading}
                  </p>
                </div>
                <a
                  href="/chat"
                  className="mt-6 md:mt-0 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  {homeData.finalCTA.buttonText}
                  <FiChevronRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;