import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VscBook } from "react-icons/vsc";
import { getAllArticles } from "../../../services/operations/articleAPI";

const Articles = () => {
  const navigate = useNavigate();
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
      <div className="border-b border-blue-950/30 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <VscBook className="text-blue-400" /> Learn Articles
        </h1>
        <p className="text-xs text-blue-300/70 mt-1">
          Explore technical articles, engineering deep-dives, and tutorials generated live by our admin & editorial team.
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-[#0c0e1a] border border-blue-950/30 rounded-2xl">
          <p className="text-sm font-semibold text-blue-300/80">No published articles yet.</p>
          <p className="text-xs text-blue-400/50 mt-1">Articles published by admins will appear here instantly.</p>
        </div>
      ) : (
        /* Article Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/dashboard/articles/${article.id}`)}
              className="bg-[#0c0e1a] border border-blue-950/30 hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="bg-blue-950/40 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    {article.category}
                  </span>
                  <span className="text-blue-300/60 font-medium">{article.readTime}</span>
                </div>
                <h2 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-xs text-blue-300/70 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-950/30 flex items-center justify-between text-[11px] text-blue-300/60">
                <span>By {article.author}</span>
                <span className="text-blue-400 font-bold group-hover:underline">Read Article →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
