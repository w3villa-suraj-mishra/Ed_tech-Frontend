import React from 'react'

const reviews = [
    {
        name: "Vedant Jain",
        role: "Final year student",
        review: "I've tried understanding DSA many times earlier through different resources, but Supreme batch really stood out on the top. The way and quality of teaching is unmatched.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vedant"
    },
    {
        name: "Anshika Aggarwal",
        role: "1.5 YOE as MTS",
        review: "When I started this course I was not at all confident in DSA but now I feel so confident and literally I want to say thanks to Love Bhaiya and Lakshay bhaiya from bottom of heart. Thankyou so much for sharing so much of knowledge with us.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anshika"
    },
    {
        name: "Tushar Gupta",
        role: "Software Engineer",
        review: "Codehelp has helped me a lot in my placement journey. This YouTube channel helps me to learn Data Structures and Algorithms, Operating Systems and DBMS.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tushar"
    },
    {
        name: "Rajni Kant",
        role: "BBA Student",
        review: "This was the best, course I ever completed. You won't believe I'm graduating from BBA, but his teaching made me start loving coding. Now just because of this course I am looking for a job in IT and enhace my carrier in tech field.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi"
    },
    {
        name: "Bhavya Bhalla",
        role: "Student",
        review: "This course is beginner friendly starting from basics of C++ to advanced concepts such as Graphs and DP. Before this course, I was very much afraid of DP but the rules taugh.",
         image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bhaya bhalla"
    },
    {
        name: "Avi Juneja",
        role: "SDE Intern",
        review: "I have been following Babbar bhaiya from my first year of College. I belong to ECE branch and had no one to guide me for my career. His roadmap and content helped me to get an internship at a top product based company.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Avi"
    }
];

const Reviewslider = () => {
    return (
        <div className='w-full py-10'>
            <div className='text-center mb-16'>
                {/* <h1 className='text-4xl font-bold text-white mb-4'>What our Student Says</h1> */}
                <p className='text-richblack-300 max-w-[700px] mx-auto'>
                    Discover inspiration and insights through recent reviews from our students. Their success stories reflect the transformative journey of learning and growth with CodeHelp.
                </p>
            </div>

            <div className='columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 w-11/12 max-w-maxContent mx-auto'>
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className='break-inside-avoid bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-pure-greys-100 flex flex-col gap-4'
                    >
                        <div className='flex items-center gap-4'>
                            <img
                                src={review.image}
                                alt={review.name}
                                className='w-14 h-14 rounded-full bg-richblack-50 shadow-sm'
                            />
                            <div>
                                <p className='font-bold text-richblack-800 text-[18px]'>{review.name}</p>
                                <p className='text-sm text-richblack-500 font-medium'>{review.role}</p>
                            </div>
                        </div>

                        <p className='text-richblack-700 leading-relaxed text-[15px]'>
                            {review.review}
                        </p>

                        <div className='mt-2 flex gap-1 text-yellow-100'>
                            {"★".repeat(5)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Reviewslider
