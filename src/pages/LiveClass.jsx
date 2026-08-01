import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createConsumer } from '@rails/actioncable';
import { BsSendFill, BsCameraVideoFill, BsMicMuteFill, BsMicFill, BsCameraVideoOffFill, BsRecordCircle, BsChatLeftDotsFill, BsPeople } from 'react-icons/bs';
import { BASE_URL } from '../services/apis';

import { useParams } from 'react-router-dom';
import { fetchCourseDetails } from '../services/operations/courseDetailsAPI';

const LiveClass = () => {
  const { courseId } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [cable, setCable] = useState(null);
  const [channel, setChannel] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [course, setCourse] = useState(null);
  const messagesEndRef = useRef(null);
  const jitsiContainerRef = useRef(null);

  const sessionId = 1; // You can make this dynamic too if needed

  useEffect(() => {
    const getDetails = async () => {
      const result = await fetchCourseDetails(courseId);
      if (result) {
        setCourse(result);
      }
    };
    getDetails();
  }, [courseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // JITSI INTEGRATION
  useEffect(() => {
    if (!course) return;

    const domain = "meet.jit.si";
    const roomName = `EdTech_Course_${courseId}`;
    const isInstructor = user?.account_type === "Instructor" && String(course?.instructor_id) === String(user?._id);
    
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    loadJitsiScript().then(() => {
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: `${user?.firstName} ${user?.lastName}` || "Instructor",
          email: user?.email
        },
        configOverwrite: {
          startWithAudioMuted: !isInstructor,
          startWithVideoMuted: !isInstructor,
          disableThirdPartyRequests: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          remoteVideoMenu: {
            disableKick: !isInstructor,
          },
          disableRemoteMute: !isInstructor,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        }
      };
      const api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(api);

      return () => api.dispose();
    });
  }, [courseId, sessionId, user]);

  // ACTIONCABLE CHAT
  useEffect(() => {
    if (!token) return;

    const wsProtocol = BASE_URL.includes('https') ? 'wss' : 'ws';
    const baseUrlStripped = BASE_URL.replace(/^https?:\/\//, '');
    const actionCableUrl = `${wsProtocol}://${baseUrlStripped}/cable?token=${token}`;
    const newCable = createConsumer(actionCableUrl);

    setCable(newCable);

    const newChannel = newCable.subscriptions.create(
      { channel: 'LiveChatChannel', session_id: sessionId },
      {
        connected: () => console.log('Connected to LiveChatChannel'),
        disconnected: () => console.log('Disconnected from LiveChatChannel'),
        received: (data) => {
          setMessages((prev) => [...prev, data]);
        },
      }
    );

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
      newCable.disconnect();
    };
  }, [token, sessionId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() === '' || !channel) return;

    channel.send({ content: messageInput });
    setMessageInput('');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-richblack-900 text-richblack-5 font-['Inter'] overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col p-4 relative">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-full text-xs font-bold uppercase border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Session
            </div>
            <h1 className="text-lg font-bold text-richblack-5">{course?.courseName || "Loading Session..."}</h1>
          </div>
          <div className="flex items-center gap-4 text-richblack-300 text-sm">
            <span className="flex items-center gap-2 bg-richblack-800 px-4 py-1.5 rounded-full border border-richblack-700">
              <BsPeople size={16} className="text-yellow-50" />
              128 Students Active
            </span>
          </div>
        </div>

        <div className="flex-1 bg-richblack-950 rounded-2xl border border-richblack-800 shadow-2xl overflow-hidden relative">
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-[400px] border-l border-richblack-800 bg-richblack-900 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-richblack-800 bg-richblack-800/50">
          <div className="flex items-center gap-3 mb-1">
            <BsChatLeftDotsFill className="text-yellow-50" />
            <h2 className="text-lg font-bold">Session Chat</h2>
          </div>
          <p className="text-xs text-richblack-400">Collaborate with students in real-time</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-richblack-400 text-center px-10">
              <div className="w-16 h-16 bg-richblack-800 rounded-full flex items-center justify-center mb-4">
                <BsSendFill size={24} className="text-richblack-600" />
              </div>
              <p className="text-sm font-medium">No messages yet.</p>
              <p className="text-xs mt-1">Start the conversation by sending a message below!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.user_id === user?._id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-richblack-400 uppercase tracking-tighter">
                    {msg.user_id === user?._id ? 'You' : (msg.user_name || 'Student')}
                  </span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm ${
                  msg.user_id === user?._id 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-richblack-900 rounded-tr-none font-medium' 
                    : 'bg-richblack-800 text-richblack-5 rounded-tl-none border border-richblack-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-richblack-800/50 border-t border-richblack-800">
          <form onSubmit={sendMessage} className="relative group">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-richblack-900 border border-richblack-700 text-richblack-5 rounded-xl py-3.5 pl-5 pr-14 text-sm outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 placeholder:text-richblack-600"
            />
            <button 
              type="submit"
              disabled={!messageInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-yellow-50 text-richblack-900 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-yellow-100 active:scale-90 shadow-lg"
            >
              <BsSendFill size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveClass;
