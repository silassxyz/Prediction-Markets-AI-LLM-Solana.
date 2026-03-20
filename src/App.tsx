/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Hexagon, TrendingUp, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface Market {
  id: number;
  question: string;
  prob: number;
  volume: string;
  category: string;
}

const MARKETS: Market[] = [
  { id: 1, question: "Will the US Federal Reserve cut rates before June 2026?", prob: 0.62, volume: "$14.2M", category: "Economics" },
  { id: 2, question: "Will Bitcoin exceed $120,000 before end of Q2 2026?", prob: 0.41, volume: "$8.7M", category: "Crypto" },
  { id: 3, question: "Will Germany pass a new AI regulation law in 2026?", prob: 0.28, volume: "$2.1M", category: "Politics · EU" },
  { id: 4, question: "Will Solana surpass Ethereum in daily active addresses by Q3 2026?", prob: 0.35, volume: "$5.4M", category: "Crypto" },
  { id: 5, question: "Will OpenAI release GPT-5 before July 2026?", prob: 0.73, volume: "$11.8M", category: "AI" }
];

const getProbColor = (prob: number) => {
  if (prob >= 0.6) return 'var(--color-accent3)';
  if (prob >= 0.4) return 'var(--color-warn)';
  return 'var(--color-red)';
};

export default function App() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const analyzeSelected = useCallback(async () => {
    if (!selectedMarket) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    setTimestamp(null);

    const prompt = `You are OracleX, an AI prediction market analyst running on Solana.

Analyze this prediction market:
QUESTION: "${selectedMarket.question}"
CURRENT MARKET PROBABILITY: ${Math.round(selectedMarket.prob * 100)}%
VOLUME: ${selectedMarket.volume}
CATEGORY: ${selectedMarket.category}

Your task:
1. Give YOUR independent probability estimate (be specific, e.g. "I estimate 71%")
2. Explain your reasoning in 3-4 sentences using real-world knowledge
3. Identify the key risk factors (1-2 points)
4. Give a clear TRADE SIGNAL: BUY YES, BUY NO, or HOLD (only trade if your estimate differs >5% from market)
5. State a suggested position size as % of portfolio (max 15%)

Format your response clearly with these sections:
MY ESTIMATE | REASONING | KEY RISKS | TRADE SIGNAL | POSITION SIZE

Keep it sharp and data-driven. This is for a live trading agent.`;

    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      setError("// ERROR: API key is missing. Please ensure GEMINI_API_KEY is set in the environment.");
      setIsAnalyzing(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI agent.");

      setAnalysisResult(text);
      setTimestamp(new Date().toLocaleTimeString('de-DE'));
    } catch (err: any) {
      console.error(err);
      setError(`// ERROR: ${err.message || 'Failed to generate analysis'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedMarket]);

  const isBuy = analysisResult?.toUpperCase().includes('BUY YES');
  const isSell = analysisResult?.toUpperCase().includes('BUY NO');

  return (
    <div className="container mx-auto max-w-[900px] px-6 py-8 relative z-10">
      <header className="flex items-center gap-4 mb-12 pb-6 border-b border-border">
        <div className="font-mono text-2xl font-bold text-accent tracking-tighter">
          Oracle<span className="text-accent2">X</span>
        </div>
        <div className="font-mono text-[0.65rem] bg-accent2/15 border border-accent2 text-accent2 px-2 py-0.5 rounded-sm tracking-[2px]">
          BETA
        </div>
        <div className="ml-auto flex items-center gap-2 font-mono text-[0.7rem] text-muted">
          <div className="w-1.5 h-1.5 rounded-full bg-accent3 animate-[pulse_2s_infinite]"></div>
          <span>SOLANA DEVNET</span>
        </div>
      </header>

      <div className="text-[0.8rem] font-mono text-muted tracking-[1px] mb-8">
        // LLM-POWERED PREDICTION MARKET AGENT · INFORMATION ASYMMETRY ENGINE
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[0.65rem] text-muted tracking-[3px] uppercase">
          Live Markets · Polymarket
        </div>
        <div className="font-mono text-[0.65rem] text-muted tracking-[3px] uppercase">
          {MARKETS.length} markets loaded
        </div>
      </div>

      <div className="grid gap-3 mb-8">
        {MARKETS.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ borderColor: 'rgba(0,229,255,0.3)' }}
            onClick={() => setSelectedMarket(m)}
            className={`bg-surface border border-border rounded-sm p-4 cursor-pointer transition-all relative overflow-hidden ${
              selectedMarket?.id === m.id ? 'border-accent bg-accent/5' : ''
            }`}
          >
            {selectedMarket?.id === m.id && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />
            )}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="text-[0.9rem] font-medium leading-relaxed flex-1">
                {m.question}
              </div>
              <div 
                className="font-mono text-xl font-bold whitespace-nowrap"
                style={{ color: getProbColor(m.prob) }}
              >
                {Math.round(m.prob * 100)}%
              </div>
            </div>
            <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${m.prob * 100}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: getProbColor(m.prob) }}
              />
            </div>
            <div className="flex gap-4 mt-2 font-mono text-[0.65rem] text-muted">
              <span>VOL {m.volume}</span>
              <span>·</span>
              <span>{m.category}</span>
              <span>·</span>
              <span>POLYMARKET</span>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={analyzeSelected}
        disabled={!selectedMarket || isAnalyzing}
        className={`w-full p-3.5 bg-transparent border border-accent text-accent font-mono text-[0.8rem] tracking-[2px] rounded-sm transition-all ${
          !selectedMarket || isAnalyzing ? 'opacity-50 cursor-not-allowed border-muted text-muted' : 'hover:bg-accent/10'
        }`}
      >
        {isAnalyzing ? '⟳ ANALYZING...' : selectedMarket ? `⬡ ANALYZE: "${selectedMarket.question.substring(0, 40)}..."` : '⬡ SELECT A MARKET TO ANALYZE'}
      </button>

      <div className="mt-6">
        <div className="bg-surface border border-border rounded-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-accent2/5">
            <div className="font-mono text-[0.7rem] tracking-[2px] text-accent2">
              // AI AGENT OUTPUT · Google Gemini
            </div>
            <div className="font-mono text-[0.65rem] text-muted tracking-[3px] uppercase">
              {isAnalyzing ? 'PROCESSING...' : analysisResult ? 'ANALYSIS COMPLETE' : 'AWAITING INPUT'}
            </div>
          </div>
          <div className="p-5 min-h-[200px]">
            {isAnalyzing && (
              <div className="h-0.5 w-full animate-shimmer mb-4" />
            )}
            
            <AnimatePresence mode="wait">
              {!selectedMarket && !isAnalyzing && !analysisResult && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[200px] gap-3 text-muted"
                >
                  <Hexagon className="w-8 h-8 opacity-30" />
                  <div className="font-mono text-[0.75rem] tracking-[1px]">
                    SELECT A MARKET · THEN RUN ANALYSIS
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red font-mono text-[0.75rem] p-4 border border-red/30 rounded-sm"
                >
                  {error}
                </motion.div>
              )}

              {analysisResult && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-4 font-mono text-[0.65rem] text-muted">
                    <span className="bg-accent2/15 border border-accent2/40 text-accent2 px-1.5 py-0.5 rounded-sm text-[0.6rem]">
                      gemini-3-flash
                    </span>
                    <span>{timestamp}</span>
                    <span>· PREDICTION MARKET ANALYSIS</span>
                  </div>
                  <div className="text-[0.875rem] leading-relaxed text-text whitespace-pre-wrap font-sans">
                    {analysisResult}
                  </div>
                  
                  {(isBuy || isSell) && (
                    <div className={`flex items-center gap-3 p-3 mt-4 rounded-sm font-mono text-[0.75rem] border ${
                      isBuy ? 'bg-accent3/5 border-accent3/20' : 'bg-red/5 border-red/20'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${isBuy ? 'text-accent3' : 'text-red'}`} />
                      <span className="text-muted">SIMULATED TRADE</span>
                      <span className={`font-bold ${isBuy ? 'text-accent3' : 'text-red'}`}>
                        {isBuy ? `BUY YES @ ${selectedMarket?.prob.toFixed(2)} USDC` : `BUY NO @ ${(1 - (selectedMarket?.prob || 0)).toFixed(2)} USDC`}
                      </span>
                      <span className="ml-auto text-muted text-[0.65rem]">Solana Devnet · Paper Trade</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-border flex justify-between items-center font-mono text-[0.65rem] text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-linear-to-br from-[#9945FF] to-[#14F195]" />
          <span>BUILT ON SOLANA · AACHEN BLOCKCHAIN CLUB · 2026</span>
        </div>
        <span>SUPERTEAM GERMANY IDEATHON</span>
      </footer>
    </div>
  );
}
