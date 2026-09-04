"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SEQUENCE = [
  { text: "I'm Kowsik Y.", className: "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-2 gradient-text-minimal inline-block" },
  { text: "GenAI & ML Engineer", className: "text-2xl sm:text-3xl lg:text-4xl text-muted-foreground font-medium" }
];

export default function AITypewriter() {
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentLineIndex >= SEQUENCE.length) return;

    const fullText = SEQUENCE[currentLineIndex].text;

    if (currentText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length + 1));
      }, 30 + Math.random() * 40);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCompletedLines((prev) => [...prev, currentLineIndex]);
        setCurrentText("");
        setCurrentLineIndex((prev) => prev + 1);
      }, currentLineIndex === 1 ? 400 : 800); // Shorter pause for loading lines
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentText]);

  return (
    <div className="flex flex-col items-start min-h-62.5 font-sans">
      {SEQUENCE.map((line, index) => {
        if (index > currentLineIndex) return null;

        const isCurrentLine = index === currentLineIndex;
        const isCompleted = completedLines.includes(index);
        
        if (!isCurrentLine && !isCompleted) return null;

        const isMainTitle = index === 3;
        const isSubTitle = index === 4;
        const MotionTag = isMainTitle ? motion.h1 : (isSubTitle ? motion.h2 : motion.div) as any;

        return (
          <MotionTag
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${line.className} flex items-center flex-wrap`}
          >
            <span>{isCurrentLine ? currentText : line.text}</span>
            {isCurrentLine && (
              <span
                className={`inline-block w-[0.4em] h-[1em] bg-foreground ml-1 align-middle transition-opacity duration-75 ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </MotionTag>
        );
      })}
      
      {/* Final blinking cursor when finished */}
      {currentLineIndex >= SEQUENCE.length && (
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
         >
            <span
              className={`inline-block w-[0.4em] h-[1em] bg-foreground align-middle transition-opacity duration-75 ${
                showCursor ? "opacity-100" : "opacity-0"
              }`}
            />
         </motion.div>
      )}
    </div>
  );
}
