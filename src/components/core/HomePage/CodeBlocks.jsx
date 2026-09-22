import React, { useState } from 'react';
import CTAButton from "./Button";
import { FiCopy, FiCheck, FiTerminal } from 'react-icons/fi';

const FaArrowRight = () => <span>→</span>;

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  codeColor,
  filename = "Component.jsx"
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeblock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeblock.split('\n');

  return (
    <div className={`flex ${position} my-12 lg:my-20 justify-between items-center flex-col lg:gap-14 gap-10`}>
      
      {/* Left / Text Side */}
      <div className="w-full lg:w-[48%] flex flex-col gap-6 text-left">
        <div className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          {heading}
        </div>
        
        <p className="text-base text-gray-600 font-normal leading-relaxed max-w-xl">
          {subheading}
        </p>

        {/* Feature Checkpoints for Richness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
            <span>Real-time Code Execution</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
            <span>Automated Test Feedback</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
            <span>Industry Best Practices</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
            <span>Zero Local Setup Required</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
            <span className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </span>
          </CTAButton>

          {ctabtn2 && (
            <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
              {ctabtn2.btnText}
            </CTAButton>
          )}
        </div>
      </div>

      {/* Right / Modern Code Window */}
      <div className="w-full lg:w-[50%] max-w-xl">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-xs sm:text-sm">
          
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <div className="ml-3 flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <FiTerminal className="text-blue-400 text-xs" />
                <span>playground.tsx</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
              title="Copy snippet"
            >
              {copied ? (
                <>
                  <FiCheck className="text-emerald-400 text-xs" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <FiCopy className="text-xs" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Window Body with Line Numbers */}
          <div className="p-4 sm:p-5 flex font-mono leading-relaxed overflow-x-auto custom-scrollbar">
            {/* Line Indexing */}
            <div className="select-none text-slate-600 pr-4 text-right w-7 shrink-0 font-medium">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Content */}
            <div className="text-slate-100 flex-1 whitespace-pre overflow-x-auto">
              {lines.map((line, idx) => (
                <div key={idx} className="hover:bg-slate-800/40 px-1 rounded">
                  {line.includes('import') || line.includes('export') || line.includes('const') || line.includes('return') ? (
                    <span className="text-[#3BA7F2] font-semibold">{line}</span>
                  ) : line.includes('<') || line.includes('>') ? (
                    <span className="text-blue-300">{line}</span>
                  ) : line.includes('http') || line.includes('"') || line.includes("'") ? (
                    <span className="text-emerald-300">{line}</span>
                  ) : (
                    <span className="text-slate-200">{line}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Footer Indicator */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>TypeScript Ready • React 19</span>
            </span>
            <span className="font-mono text-slate-500">UTF-8</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CodeBlocks;
