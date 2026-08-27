import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import AdminModal from '../../components/admin/AdminModal';
import { practiceEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaFilter, FaFileImport } from 'react-icons/fa';

export default function AdminPracticeBank() {
  return (
    <AdminProtectedRoute>
      <AdminPracticeBankInner />
    </AdminProtectedRoute>
  );
}

function AdminPracticeBankInner() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Question Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'MCQ',
    categoryId: '',
    topicId: '',
    difficulty: 'Easy',
    explanation: '',
    marks: 1,
    negativeMarks: 0,
    status: 'published',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    codingDetails: {
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      exampleInput: '',
      exampleOutput: '',
      starterCode: 'function solution() {\n  // Write code here\n}',
    },
    interviewDetails: {
      sampleAnswer: '',
      keyPoints: '',
    }
  });

  // Category/Topic Form State
  const [catName, setCatName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [selectedCatForTopic, setSelectedCatForTopic] = useState('');

  // Bulk CSV Text
  const [csvText, setCsvText] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = `${practiceEndpoints.ADMIN_QUESTIONS}?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;

      const res = await apiConnector('GET', url, null, { Authorization: `Bearer ${adminToken}` });
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_PRACTICE_CATEGORIES);
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [search, typeFilter, difficultyFilter]);

  const handleOpenCreateModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        title: q.title || '',
        type: q.type || 'MCQ',
        categoryId: q.categoryId || '',
        topicId: q.topicId || '',
        difficulty: q.difficulty || 'Easy',
        explanation: q.explanation || '',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        status: q.status || 'published',
        options: q.options && q.options.length === 4 ? q.options.map(o => ({ text: o.optionText, isCorrect: o.isCorrect })) : [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        codingDetails: q.codingDetails || {
          problemStatement: '',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          exampleInput: '',
          exampleOutput: '',
          starterCode: 'function solution() {\n  // Write code here\n}',
        },
        interviewDetails: q.interviewDetails || {
          sampleAnswer: '',
          keyPoints: '',
        }
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        title: '',
        type: 'MCQ',
        categoryId: '',
        topicId: '',
        difficulty: 'Easy',
        explanation: '',
        marks: 1,
        negativeMarks: 0,
        status: 'published',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        codingDetails: {
          problemStatement: '',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          exampleInput: '',
          exampleOutput: '',
          starterCode: 'function solution() {\n  // Write code here\n}',
        },
        interviewDetails: {
          sampleAnswer: '',
          keyPoints: '',
        }
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        options: formData.type === 'MCQ' ? formData.options : undefined
      };

      if (editingQuestion) {
        await apiConnector('PUT', `${practiceEndpoints.ADMIN_QUESTIONS}/${editingQuestion.id}`, payload, {
          Authorization: `Bearer ${adminToken}`
        });
        toast.success('Question updated successfully');
      } else {
        await apiConnector('POST', practiceEndpoints.ADMIN_QUESTIONS, payload, {
          Authorization: `Bearer ${adminToken}`
        });
        toast.success('Question created successfully');
      }

      setIsQuestionModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_QUESTIONS}/${id}`, null, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_CATEGORIES, { name: catName }, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success('Category created');
      setCatName('');
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedCatForTopic) {
      toast.error('Select a category first');
      return;
    }
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_TOPICS, { categoryId: selectedCatForTopic, name: topicName }, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success('Topic created');
      setTopicName('');
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create topic');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      // Simple format: Title,Type,Difficulty,Explanation
      const lines = csvText.split('\n').filter(l => l.trim());
      const parsedQuestions = lines.map(line => {
        const parts = line.split(',');
        return {
          title: parts[0]?.trim(),
          type: parts[1]?.trim() || 'MCQ',
          difficulty: parts[2]?.trim() || 'Easy',
          explanation: parts[3]?.trim() || '',
          options: [
            { text: parts[4]?.trim() || 'Option A', isCorrect: true },
            { text: parts[5]?.trim() || 'Option B', isCorrect: false },
            { text: parts[6]?.trim() || 'Option C', isCorrect: false },
            { text: parts[7]?.trim() || 'Option D', isCorrect: false },
          ]
        };
      });

      await apiConnector('POST', practiceEndpoints.ADMIN_BULK_QUESTIONS, { questions: parsedQuestions }, {
        Authorization: `Bearer ${adminToken}`
      });

      toast.success(`Uploaded ${parsedQuestions.length} questions`);
      setIsBulkModalOpen(false);
      setCsvText('');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to bulk upload');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F2FF]">Practice Question Bank 🎯</h1>
          <p className="text-xs text-[#AFB2BF] mt-1">Manage MCQs, Coding Problems, and Interview Questions.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 bg-[#2C333F] hover:bg-[#3E4553] text-white text-xs font-semibold rounded-xl transition-all"
          >
            Manage Categories/Topics
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3 py-2 bg-[#2C333F] hover:bg-[#3E4553] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FaFileImport /> Bulk CSV
          </button>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-[#FFD60A] text-black hover:bg-[#e5c009] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <FaPlus /> Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#585D69] text-sm" />
          <input
            type="text"
            placeholder="Search questions by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#585D69] focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-xs text-[#AFB2BF] focus:outline-none focus:border-[#FFD60A]"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="Coding">Coding</option>
            <option value="Interview">Interview</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-xs text-[#AFB2BF] focus:outline-none focus:border-[#FFD60A]"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] border-b border-[#2C333F] text-[#AFB2BF] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Question Title</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Category / Topic</th>
                  <th className="px-5 py-3.5">Difficulty</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C333F] text-[#F1F2FF]">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[#585D69]">
                      No questions found. Click "Add Question" to create one.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr key={q.id} className="hover:bg-[#1f2736] transition-colors">
                      <td className="px-5 py-4 font-medium max-w-sm truncate">{q.title}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          q.type === 'MCQ' ? 'bg-blue-500/20 text-blue-400' :
                          q.type === 'Coding' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {q.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#AFB2BF]">
                        {q.category?.name || 'General'} {q.topic ? `> ${q.topic.name}` : ''}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${
                          q.difficulty === 'Easy' ? 'text-emerald-400' :
                          q.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenCreateModal(q)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-[#2C333F] rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isQuestionModalOpen && (
        <AdminModal title={editingQuestion ? 'Edit Question' : 'Create Question'} onClose={() => setIsQuestionModalOpen(false)}>
          <form onSubmit={handleSaveQuestion} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Question Title / Statement *</label>
              <textarea
                required
                rows={3}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                placeholder="Enter title or question statement..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="Coding">Coding Problem</option>
                  <option value="Interview">Interview Question</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* MCQ Options */}
            {formData.type === 'MCQ' && (
              <div className="space-y-2 pt-2 border-t border-[#2C333F]">
                <label className="block text-slate-300 font-semibold">Options (Select Correct Answer)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOpts = formData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="accent-[#FFD60A]"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].text = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Coding Problem Fields */}
            {formData.type === 'Coding' && (
              <div className="space-y-3 pt-2 border-t border-[#2C333F]">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Problem Statement</label>
                  <textarea
                    rows={3}
                    value={formData.codingDetails.problemStatement}
                    onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, problemStatement: e.target.value } })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starter Code</label>
                  <textarea
                    rows={3}
                    value={formData.codingDetails.starterCode}
                    onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, starterCode: e.target.value } })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Explanation / Solution</label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                placeholder="Explain the correct answer..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 bg-[#2C333F] text-white rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FFD60A] text-black font-bold rounded-xl"
              >
                Save Question
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* CATEGORIES / TOPICS MODAL */}
      {isCategoryModalOpen && (
        <AdminModal title="Manage Categories & Topics" onClose={() => setIsCategoryModalOpen(false)}>
          <div className="space-y-6 text-xs">
            {/* Create Category */}
            <form onSubmit={handleCreateCategory} className="space-y-2 border-b border-[#2C333F] pb-4">
              <label className="block text-slate-300 font-semibold">Create New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. JavaScript, Python, Data Structures"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-white"
                />
                <button type="submit" className="px-4 py-2 bg-[#FFD60A] text-black font-bold rounded-xl">Add</button>
              </div>
            </form>

            {/* Create Topic */}
            <form onSubmit={handleCreateTopic} className="space-y-2">
              <label className="block text-slate-300 font-semibold">Create New Topic under Category</label>
              <select
                value={selectedCatForTopic}
                onChange={(e) => setSelectedCatForTopic(e.target.value)}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-white mb-2"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Promises, Async/Await"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-white"
                />
                <button type="submit" className="px-4 py-2 bg-[#FFD60A] text-black font-bold rounded-xl">Add Topic</button>
              </div>
            </form>
          </div>
        </AdminModal>
      )}

      {/* BULK CSV MODAL */}
      {isBulkModalOpen && (
        <AdminModal title="Bulk Upload Questions (CSV Format)" onClose={() => setIsBulkModalOpen(false)}>
          <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
            <p className="text-slate-400">Paste CSV lines formatted as: <br/><code className="text-[#FFD60A]">Question Title,Type,Difficulty,Explanation,OptA,OptB,OptC,OptD</code></p>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="What is closure in JS?,MCQ,Easy,Closure retains scope,A function with scope,An object,A loop,A string"
              className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white font-mono"
            />
            <button type="submit" className="w-full py-2.5 bg-[#FFD60A] text-black font-bold rounded-xl">Upload Questions</button>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  );
}
