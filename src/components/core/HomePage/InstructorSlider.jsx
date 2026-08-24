import React, { useState, useEffect } from 'react';

const mentorsListFallback = [
    {
        name: "Lakshay Kumar",
        titleQuote: "Transforming Learners into Industry Leaders.",
        quote: 'From startups to tech giants, "We bridge the gap between learning and doing". Through real-world challenges, personalized mentorship, and a thriving community, we empower developers to ship products that matter. Excellence is the only standard.',
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Suraj Mishra",
        titleQuote: "Master Code with Real-World Industry Insights.",
        quote: 'Guided by top educators and industry specialists. We focus on deep problem-solving, architectural design principles, and building scalable production software.',
        image: "https://media.licdn.com/dms/image/v2/D4D03AQF1LC7IF8pJxw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1718271689934?e=2147483647&v=beta&t=7O0HdYCZTLlH-OPVtMLTcXoGAfoMMQzMuwbMS_UlUSo"
    }
];

const InstructorSlider = ({ dynamicInstructors = [] }) => {
    const [current, setCurrent] = useState(0);

    const mentors = (dynamicInstructors && dynamicInstructors.length > 0)
        ? dynamicInstructors.map(inst => ({
            name: `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Expert Mentor',
            titleQuote: inst.profile?.about ? inst.profile.about.slice(0, 50) : "Transforming Learners into Industry Leaders.",
            quote: inst.profile?.about || 'From startups to tech giants, "We bridge the gap between learning and doing". Through real-world challenges, personalized mentorship, and a thriving community, we empower developers to ship products that matter. Excellence is the only standard.',
            image: inst.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
        }))
        : mentorsListFallback;

    useEffect(() => {
        if (mentors.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
        }, 7000);
        return () => clearInterval(timer);
    }, [mentors.length]);

    const activeMentor = mentors[current] || mentors[0];

    return (
        <div className='w-full max-w-[1260px] mx-auto px-4 py-8 text-left font-sans'>
            {/* Header */}
            <div className='mb-10'>
                <h2 className='text-3xl sm:text-4xl font-extrabold text-white tracking-tight'>
                    Meet Your Mentors
                </h2>
                <p className='text-xs sm:text-sm text-richblack-300 mt-2 font-medium max-w-3xl leading-relaxed'>
                    Guided by top educators and ex–Amazon & Microsoft engineer, who has mentored millions of students in mastering coding.
                </p>
            </div>

            {/* Main Content Area */}
            <div className='relative w-full min-h-[360px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 my-4'>
                {/* Left Column: Image with Dark Vignette Blend */}
                <div className='w-full md:w-1/2 flex justify-center items-center relative'>
                    <div className='relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[360px] rounded-full overflow-hidden flex items-center justify-center bg-richblack-900'>
                        {/* Soft Outer Vignette Overlay */}
                        <div className='absolute inset-0 shadow-[radial-gradient(circle,_transparent_35%,_#000000_90%)] z-10 pointer-events-none'></div>
                        <div className='absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10 pointer-events-none opacity-80'></div>

                        <img
                            src={activeMentor.image}
                            alt={activeMentor.name}
                            className='w-full h-full object-cover filter brightness-95 contrast-105 transition-all duration-700 ease-in-out'
                        />
                    </div>
                </div>

                {/* Right Column: Quote & Content */}
                <div className='w-full md:w-1/2 flex flex-col justify-center text-left text-white px-2 sm:px-4'>
                    <h3 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white'>
                        Transforming <span className='text-white font-black'>Learners</span> into Industry Leaders.
                    </h3>

                    <p className='text-xs sm:text-sm text-richblack-300 mt-6 leading-relaxed font-normal max-w-xl'>
                        {activeMentor.quote}
                    </p>

                    <div className='mt-8 text-right w-full pr-4'>
                        <span className='text-xs text-richblack-300 italic font-medium'>
                            ~ {activeMentor.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Carousel Indicators */}
            {mentors.length > 1 && (
                <div className='flex justify-center items-center gap-3 mt-8 z-20'>
                    {mentors.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                current === idx
                                    ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                                    : "w-2.5 bg-richblack-600 hover:bg-richblack-400"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstructorSlider;
