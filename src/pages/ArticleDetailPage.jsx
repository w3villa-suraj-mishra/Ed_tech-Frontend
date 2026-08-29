import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VscArrowLeft, VscBook, VscCalendar, VscHistory, VscPerson } from "react-icons/vsc";
import { getAllArticles } from "../services/operations/articleAPI";

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const list = await getAllArticles();
      const found = list.find((a) => String(a.id) === String(articleId));
      setArticle(found || null);
      setLoading(false);
    };
    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
        <p className="text-xs text-blue-300/70 mb-6">The article you are looking for may have been removed or updated.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white font-['Inter',sans-serif] selection:bg-blue-500 selection:text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c0e1a] border border-blue-950/30 text-blue-300 hover:text-white hover:border-blue-500/40 text-xs font-bold transition shadow-lg"
        >
          <VscArrowLeft size={16} /> Back to Articles
        </button>

        {/* ARTICLE CARD / MAIN CONTAINER */}
        <article className="bg-[#0c0e1a] border border-blue-950/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          
          {/* CATEGORY & META */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-950/30 pb-6">
            <span className="bg-blue-950/40 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-bold">
              {article.category}
            </span>

            <div className="flex items-center gap-4 text-xs text-blue-300/60 font-medium">
              <span className="flex items-center gap-1.5">
                <VscHistory size={14} className="text-blue-400" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <VscCalendar size={14} className="text-blue-400" />
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* TITLE & AUTHOR */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-blue-300/70 font-medium pt-1">
              <VscPerson size={16} className="text-blue-400" />
              <span>Written by <strong className="text-white">{article.author}</strong></span>
            </div>
          </div>

          {/* SUMMARY CALLOUT */}
          {article.summary && (
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-950/40 text-blue-200 text-xs sm:text-sm italic leading-relaxed">
              "{article.summary}"
            </div>
          )}

          {/* FULL ARTICLE BODY */}
          <div className="pt-4 border-t border-blue-950/30">
            <div className="text-sm sm:text-base leading-relaxed text-blue-100/90 space-y-4 whitespace-pre-wrap font-sans">
              {article.content}
            </div>
          </div>

        </article>

      </div>
    </div>
  );
}
