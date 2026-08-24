import React, { useState, useEffect } from "react";
import { VscBook } from "react-icons/vsc";
import { getAllArticles } from "../../../services/operations/articleAPI";

const Articles = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data || []);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  return (
    <div className="text-white space-y-6 max-w-6xl mx-auto font-['Inter',sans-serif]">
      {/* Header */}
      <div className="border-b border-purple-900/30 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <VscBook className="text-purple-400" /> Learn Articles
        </h1>
        <p className="text-xs text-purple-300/70 mt-1">
          Explore technical articles, engineering deep-dives, and tutorials generated live by our admin & editorial team.
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-[#0c0e1a] border border-purple-900/30 rounded-2xl">
          <p className="text-sm font-semibold text-purple-300/80">No published articles yet.</p>
          <p className="text-xs text-purple-400/50 mt-1">Articles published by admins will appear here instantly.</p>
        </div>
      ) : (
        /* Article Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-[#0c0e1a] border border-purple-900/30 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    {article.category}
                  </span>
                  <span className="text-purple-300/60 font-medium">{article.readTime}</span>
                </div>
                <h2 className="font-bold text-sm text-white hover:text-purple-300 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-xs text-purple-300/70 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-purple-300/60">
                <span>By {article.author}</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0e1a] border border-purple-900/40 max-w-2xl w-full rounded-2xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
              <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-purple-300/60 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedArticle.title}</h2>
            <p className="text-xs text-purple-300/60">
              Published by {selectedArticle.author} • {selectedArticle.readTime}
            </p>

            <div className="bg-[#070913] p-5 rounded-xl text-xs leading-relaxed text-purple-100/90 border border-purple-900/30 max-h-96 overflow-y-auto whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
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
