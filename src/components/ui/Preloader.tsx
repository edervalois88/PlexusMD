"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8FAFC]"
        >
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.97, 1, 0.97],
              filter: ["blur(4px)", "blur(0px)", "blur(4px)"]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4 text-slate-900 font-bold text-4xl tracking-tighter">
              <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-2xl shadow-slate-900/20">
                <Sparkles size={36} strokeWidth={2} className="text-teal-400" />
              </div>
              <span>SiAIstems</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-slate-300"></div>
              <p className="text-xs font-semibold text-slate-500 tracking-[0.3em] uppercase">
                PlexusMD Elite
              </p>
              <div className="h-[1px] w-8 bg-slate-300"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
