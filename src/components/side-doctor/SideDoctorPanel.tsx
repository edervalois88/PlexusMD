"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BrainCircuit, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { analyzePatientInsight } from "@/actions/ai";

interface SideDoctorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientHistory: unknown;
  updatedAt: string;
  reason: string;
  variant?: "overlay" | "inline";
}

interface CacheData {
  patientId: string;
  updatedAt: string;
  timestamp: number;
  insight: string;
}

export function SideDoctorPanel({
  isOpen,
  onClose,
  patientId,
  patientHistory,
  updatedAt,
  reason,
  variant = "overlay",
}: SideDoctorPanelProps) {
  const [insight, setInsight] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!isOpen || !patientId) return;

      // Optimización de Tokens (Caché local)
      const cacheKey = `sideDoctorCache_${patientId}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      
      if (cachedRaw) {
        try {
          const cacheData: CacheData = JSON.parse(cachedRaw);
          const now = Date.now();
          const thirtyMinutes = 30 * 60 * 1000;

          if (
            cacheData.patientId === patientId &&
            cacheData.updatedAt === updatedAt &&
            now - cacheData.timestamp < thirtyMinutes
          ) {
            setInsight(cacheData.insight);
            return;
          }
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }

      // Si no hay caché válido, llamar a la IA
      setIsThinking(true);
      setInsight("");
      
      try {
        const result = await analyzePatientInsight(patientHistory, reason);
        setInsight(result);
        
        // Guardar en caché
        const newCache: CacheData = {
          patientId,
          updatedAt,
          timestamp: Date.now(),
          insight: result,
        };
        localStorage.setItem(cacheKey, JSON.stringify(newCache));
      } catch (error) {
        console.error("Error fetching AI insight", error);
        setInsight("Hubo un error al analizar el expediente. Por favor intenta de nuevo.");
      } finally {
        setIsThinking(false);
      }
    };

    fetchInsight();
  }, [isOpen, patientId, updatedAt, patientHistory, reason]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {variant === "overlay" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            />
          )}

          <motion.div
            initial={variant === "overlay" ? { x: "100%" } : { opacity: 0 }}
            animate={variant === "overlay" ? { x: 0 } : { opacity: 1 }}
            exit={variant === "overlay" ? { x: "100%" } : { opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`${
              variant === "overlay"
                ? "fixed right-0 top-0 bottom-0 z-50 w-full max-w-md shadow-2xl"
                : "w-full h-full rounded-2xl"
            } bg-white/40 backdrop-blur-[16px] border border-slate-200/50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1E293B] rounded-xl">
                  <BrainCircuit className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1E293B]">Side Doctor</h2>
              </div>
              {variant === "overlay" && (
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-[#1E293B] hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {isThinking ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="p-4 bg-[#14B8A6]/20 rounded-full"
                  >
                    <Activity className="w-8 h-8 text-[#14B8A6]" />
                  </motion.div>
                  <p className="text-[#1E293B] font-medium animate-pulse">
                    Analizando expediente...
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate prose-teal max-w-none text-[#1E293B]"
                >
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => {
                        void node;
                        return <ul className="list-none pl-0 space-y-3" {...props} />;
                      },
                      li: ({ node, ...props }) => {
                        void node;
                        return (
                          <li className="flex gap-3 items-start" {...props}>
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#14B8A6] flex-shrink-0" />
                            <span className="flex-1">{props.children}</span>
                          </li>
                        );
                      },
                      h1: ({ node, ...props }) => {
                        void node;
                        return <h1 className="text-[#1E293B] font-bold text-lg mb-4 mt-6" {...props} />;
                      },
                      h2: ({ node, ...props }) => {
                        void node;
                        return <h2 className="text-[#1E293B] font-semibold text-md mb-3 mt-5" {...props} />;
                      },
                      h3: ({ node, ...props }) => {
                        void node;
                        return <h3 className="text-[#1E293B] font-medium text-base mb-2 mt-4" {...props} />;
                      },
                      strong: ({ node, ...props }) => {
                        void node;
                        return <strong className="font-semibold text-[#1E293B]" {...props} />;
                      },
                    }}
                  >
                    {insight}
                  </ReactMarkdown>
                </motion.div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 text-center border-t border-white/40 text-xs text-slate-500">
              Asistente de IA. Valide la información antes de tomar decisiones clínicas.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
