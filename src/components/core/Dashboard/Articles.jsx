import React, { useState } from "react";
import { VscBook, VscInfo } from "react-icons/vsc";

const Articles = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const sampleArticles = [
    {
      id: 1,
      title: "Mastering React Hooks & Performance Optimization",
      category: "Frontend Development",
      readTime: "8 min read",
      author: "Admin Team",
      date: "August 16, 2026",
      summary: "Comprehensive guide to using useMemo, useCallback, and custom hooks effectively in large scale web applications.",
      content: "React Hooks changed how we write component logic. When building large apps, optimizing re-renders with useMemo and useCallback becomes critical. Always measure rendering performance before memoizing."
    },
    {
      id: 2,
      title: "Node.js Microservices Architecture & Scalability",
      category: "Backend Engineering",
      readTime: "12 min read",
      author: "Admin Team",
      date: "August 12, 2026",
      summary: "Learn how to split monolithic Express applications into scalable microservices using Docker and Redis queues.",
      content: "Microservices enable independent deployment and autoscaling. By isolating domain logic into separate service modules, systems gain resilience and fault tolerance."
    },
    {
      id: 3,
      title: "Data Structures & Algorithms Cheat Sheet for Interviews",
      category: "DSA & Problem Solving",
      readTime: "15 min read",
      author: "Admin Team",
      date: "August 05, 2026",
      summary: "Essential patterns: Two Pointers, Sliding Window, Graph Traversal (DFS/BFS), and Dynamic Programming approaches.",
      content: "Focus on pattern recognition over memorizing individual questions. Dynamic programming problems typically reduce to 0/1 Knapsack, Unbounded Knapsack, or Matrix DP."
    }
  ];

  return (
    <div className="text-white space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-richblack-5 flex items-center gap-2">
          <VscBook className="text-indigo-400" /> Learn Articles
        </h1>
        <p className="text-xs text-richblack-300 mt-1">
          Explore curated technical articles, tutorials, and engineering deep-dives uploaded by instructors & admins.
        </p>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-[#12161F] border border-[#252C3A] hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold">
                  {article.category}
                </span>
                <span className="text-slate-400">{article.readTime}</span>
              </div>
              <h2 className="font-bold text-sm text-white hover:text-indigo-400 transition-colors">
                {article.title}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252C3A] flex items-center justify-between text-[11px] text-slate-400">
              <span>By {article.author}</span>
              <span>{article.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#252C3A] max-w-2xl w-full rounded-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#252C3A] pb-3">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedArticle.title}</h2>
            <p className="text-xs text-slate-400">
              Published on {selectedArticle.date} • {selectedArticle.readTime}
            </p>

            <div className="bg-[#181E2A] p-4 rounded-xl text-xs leading-relaxed text-slate-200 border border-[#262F40]">
              {selectedArticle.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 py-2 rounded-xl font-bold transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;
