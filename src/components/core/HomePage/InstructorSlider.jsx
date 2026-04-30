import React, { useState, useEffect } from 'react';

const instructors = [
    {
        name: "Suraj Mishra",
        role: "CS @Adobe, Instructor @Code-Help",
        description: "Suraj Mishra is an ace software engineer working in the role of <b>Computer Scientist II</b> at <b>Adobe Systems</b> and a popular computer science instructor on <b>CodeHelp</b> Youtube. He is working in the industry for the past <b>6 years</b>, working on different real-world problems. He is well-known among students for his amazingly simplified explanations with real-life examples, enabling students to understand complex topics very easily. Many of his ex-students are now working in top product companies like <b>Microsoft, Amazon, De-Shaw</b> etc.",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQF1LC7IF8pJxw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1718271689934?e=2147483647&v=beta&t=7O0HdYCZTLlH-OPVtMLTcXoGAfoMMQzMuwbMS_UlUSo"
    },
    {
        name: "Aditya Kumar",
        role: "Founder - Code-Help, Ex-Amazon, Ex-Microsoft",
        description: "Aditya Kumar is a <b>Software Engineer</b> and a Youtuber, primarily known for his Coding and Software Engineering skills. He is quite a popular figure among students so far. He has done his B.Tech (IT) from the Netaji Subhash Institute of Technology (NSIT), Delhi, and worked in <b>Amazon</b> and <b>Microsoft</b>.",
        image: "data:image/jpeg;base64,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",

    }
];

const InstructorSlider = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === instructors.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrent(current === instructors.length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? instructors.length - 1 : current - 1);
    };

  return (
    <div className='w-full max-w-[1100px] mx-auto px-4'>
        <div className='flex flex-col gap-4 mb-10 relative'>
            <h1 className='text-4xl font-bold text-white'>Our Instructor</h1>
            <p className='text-richblack-300 lg:w-[60%]'>
                Discover brilliance in code with our expert instructors. Passionate mentors dedicated to fueling your coding journey at StudyNotion.
            </p>
            
            <div className='absolute right-0 top-0 hidden lg:flex gap-4'>
                <button 
                    onClick={prevSlide}
                    className='w-12 h-12 rounded-full bg-richblack-800 flex items-center justify-center text-white hover:bg-richblack-700 transition-all border border-richblack-700 shadow-lg'
                >
                    ←
                </button>
                <button 
                    onClick={nextSlide}
                    className='w-12 h-12 rounded-full bg-richblack-800 flex items-center justify-center text-white hover:bg-richblack-700 transition-all border border-richblack-700 shadow-lg'
                >
                    →
                </button>
            </div>
        </div>

        <div className='relative overflow-hidden rounded-[2.5rem] bg-[#16171d] border border-richblack-800 shadow-[0_30px_60px_rgba(0,0,0,0.6)]'>
            <div 
                className='flex transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)'
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {instructors.map((instructor, index) => (
                    <div key={index} className='w-full flex-shrink-0 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 p-8 lg:p-16'>
                        
                        {/* Image Section */}
                        <div className='relative lg:w-[40%] flex justify-center items-center flex-shrink-0'>
                            <div className='absolute w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] opacity-30'>
                                <div className='absolute inset-0 border-[1px] border-purple-500/30 rounded-full scale-[0.6]'></div>
                                <div className='absolute inset-0 border-[1px] border-purple-500/40 rounded-full scale-[0.8]'></div>
                                <div className='absolute inset-0 border-[1px] border-purple-500/50 rounded-full scale-[1.0]'></div>
                                <div className='absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-transparent rounded-full scale-[0.9] blur-xl'></div>
                            </div>

                            <div className='relative z-10 w-[240px] h-[240px] lg:w-[350px] lg:h-[350px] rounded-3xl overflow-hidden shadow-2xl'>
                                <img 
                                    src={instructor.image} 
                                    alt={instructor.name}
                                    className='w-full h-full object-cover'
                                    onError={(e) => { e.target.src = "https://media.licdn.com/dms/image/D4D03AQH3Y7z2Q7wA/profile-displayphoto-shrink_800_800/0/1689617260021?e=2147483647&v=beta&t=7b2h1V1vX_Z1vX1vX1vX1vX1vX1vX1vX1vX1vX1vX" }}
                                />
                            </div>
                        </div>

                        {/* Text Section */}
                        <div className='lg:w-[60%] flex flex-col gap-6 text-left overflow-hidden'>
                            <div className='flex flex-col gap-2'>
                                <h2 className='text-3xl lg:text-5xl font-bold text-white tracking-tight break-words'>{instructor.name}</h2>
                                <p className='text-xl text-richblack-200 font-medium opacity-90 break-words'>{instructor.role}</p>
                            </div>
                            
                            <div 
                                className='text-richblack-200 text-base lg:text-[18px] leading-relaxed font-normal opacity-80 break-words'
                                dangerouslySetInnerHTML={{ __html: instructor.description }}
                            >
                            </div>

                            <div className='flex flex-wrap gap-4 mt-2'>
                                <div className='px-6 py-2 bg-richblack-800 rounded-lg text-sm text-richblack-5 font-semibold border border-richblack-700 whitespace-nowrap'>
                                    Expert Mentor
                                </div>
                                <div className='px-6 py-2 bg-richblack-800 rounded-lg text-sm text-richblack-5 font-semibold border border-richblack-700 whitespace-nowrap'>
                                    Industry Veteran
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className='absolute bottom-8 left-[50%] translate-x-[-50%] flex gap-3 z-20'>
                {instructors.map((_, index) => (
                    <div 
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${current === index ? "w-10 bg-white" : "w-4 bg-richblack-600 hover:bg-richblack-400"}`}
                    ></div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default InstructorSlider;
