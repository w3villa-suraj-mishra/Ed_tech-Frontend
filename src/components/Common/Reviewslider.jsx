import React, { useState, useEffect } from 'react';
import { fetchAllReviews } from '../../services/operations/courseDetailsAPI';

const Reviewslider = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const getReviewsData = async () => {
            setLoading(true);
            const data = await fetchAllReviews();
            if (data && Array.isArray(data)) {
                setReviews(data);
            }
            setLoading(false);
        };
        getReviewsData();
    }, []);

    const totalPages = Math.ceil(reviews.length / itemsPerPage);

    useEffect(() => {
        if (totalPages <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(interval);
    }, [totalPages]);

    const startIndex = currentSlide * itemsPerPage;
    const visibleReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className='w-full max-w-[1260px] mx-auto px-4 py-8 text-center font-sans'>
            {/* Header */}
            <div className='mb-12'>
                <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white'>
                    What Our <span className='text-[#a855f7]'>Learners</span> Say
                </h2>
                <p className='text-xs sm:text-sm text-richblack-300 mt-2 font-medium'>
                    Real experiences from our amazing community
                </p>
            </div>

            {/* Testimonials Content */}
            {loading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left'>
                    {Array.from({ length: itemsPerPage }).map((_, idx) => (
                        <div key={idx} className='bg-white/10 rounded-2xl p-6 h-48 animate-pulse border border-white/5 flex flex-col justify-between'>
                            <div className='h-4 bg-white/20 rounded w-3/4 mb-3'></div>
                            <div className='h-4 bg-white/20 rounded w-1/2'></div>
                            <div className='flex items-center gap-3 mt-6'>
                                <div className='w-10 h-10 rounded-full bg-white/20'></div>
                                <div className='space-y-2'>
                                    <div className='h-3 bg-white/20 rounded w-20'></div>
                                    <div className='h-2 bg-white/20 rounded w-16'></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left'>
                        {visibleReviews.map((item, idx) => {
                            const user = item.user || {};
                            const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Learner';
                            const image = user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(name)}`;
                            const designation = item.course?.courseName || user.accountType || 'Software Developer';
                            const reviewText = item.review || item.rating || "CodeLearn helped me go from zero to hero. Highly recommended!";

                            return (
                                <div
                                    key={item._id || item.id || idx}
                                    className='bg-white text-richblack-900 rounded-2xl p-7 shadow-xl border border-white/20 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5'
                                >
                                    <p className='text-xs sm:text-sm text-richblack-700 leading-relaxed font-medium mb-6 line-clamp-4'>
                                        "{reviewText}"
                                    </p>

                                    <div className='flex items-center gap-3.5 pt-4 border-t border-richblack-50 mt-auto'>
                                        <img
                                            src={image}
                                            alt={name}
                                            className='w-10 h-10 rounded-full object-cover border border-richblack-100 shadow-sm'
                                        />
                                        <div className='overflow-hidden'>
                                            <h4 className='text-sm font-bold text-richblack-900 truncate leading-tight'>
                                                {name}
                                            </h4>
                                            <p className='text-[11px] text-richblack-400 font-medium truncate mt-0.5'>
                                                {designation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Indicators */}
                    {totalPages > 1 && (
                        <div className='flex justify-center items-center gap-2.5 mt-10 z-20'>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentSlide === idx
                                            ? "w-7 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                                            : "w-2.5 bg-richblack-600 hover:bg-richblack-400"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className='bg-richblack-800 border border-richblack-700 rounded-2xl p-12 max-w-md mx-auto text-center'>
                    <p className='text-richblack-300 text-sm font-medium'>
                        No learner reviews available yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Reviewslider;
