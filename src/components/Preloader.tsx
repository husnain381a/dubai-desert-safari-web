import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-1.png";
import "./Preloader.css";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [fillProgress, setFillProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "dip" | "complete">("loading");

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setFillProgress((prev) => {
        if (prev >= 85) {
          setPhase("dip");
          return prev;
        }
        return prev + Math.random() * 25;
      });
    }, 400);

    // Handle dip down effect with delay
    const dipTimeout = setTimeout(() => {
      if (phase === "dip") {
        setFillProgress(75);
        setTimeout(() => {
          setPhase("complete");
          setFillProgress(100);
        }, 300);
      }
    }, 2800);

    // Check if page is already loaded
    if (document.readyState === "complete") {
      setPhase("complete");
      setFillProgress(100);
      setTimeout(() => setIsLoading(false), 800);
      clearInterval(progressInterval);
      clearTimeout(dipTimeout);
      return;
    }

    // Listen for page load
    const handleLoad = () => {
      setPhase("complete");
      setFillProgress(100);
      setTimeout(() => setIsLoading(false), 800);
      clearInterval(progressInterval);
      clearTimeout(dipTimeout);
    };

    window.addEventListener("load", handleLoad);

    // Fallback timeout (max 3.5 seconds)
    const timeout = setTimeout(() => {
      setPhase("complete");
      setFillProgress(100);
      setTimeout(() => setIsLoading(false), 800);
      clearInterval(progressInterval);
      clearTimeout(dipTimeout);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(dipTimeout);
      window.removeEventListener("load", handleLoad);
      clearTimeout(timeout);
    };
  }, [phase]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Logo container with clip-path fill effect */}
          <div className="relative w-40 h-40 preloader-container">
            {/* Faded/grayscale base layer */}
            <img
              src={logo}
              alt="Loading"
              className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-30"
            />

            {/* Colored fill layer with clip-path animation */}
            <img
              src={logo}
              alt="Loading Fill"
              className="absolute inset-0 w-full h-full object-contain preloader-fill"
              style={{
                clipPath: `inset(${100 - fillProgress}% 0 0 0)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
