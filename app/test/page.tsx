"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function SummaryPage() {
  const [url, setUrl] = useState('');
  // Added thumbnail to the state object
  const [videoData, setVideoData] = useState({ title: '', summary: '', thumbnail: '' });
  const [loading, setLoading] = useState(false);
  
  const generateSummary = async () => {
    if (!url) return;
    setLoading(true);
    setVideoData({ title: '', summary: '', thumbnail: '' });

    try {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      
      const res = await fetch(`/api/transcript?videoId=${videoId}`);
      const rawJson = await res.json();

      // 1. Extract Title and Thumbnail
      const title = rawJson.title || "Unknown Video Title";

      const thumbnailsArray = rawJson.thumbnails || []; 

      // Grab the last one (highest resolution) or fallback to an empty string
      const highResThumbnailUrl = thumbnailsArray.length > 0 
        ? thumbnailsArray[thumbnailsArray.length - 1].url 
        : "";
      
        // 2. Send to Gemini for the Summary
        const genAI = new GoogleGenerativeAI("AIzaSyBd1WuYoSU55hDvjXqZp3NmkAZTnf2Qxfk");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        Summarize this video briefly in 3-5 bullet points.
        Title: ${title}
        Description: ${rawJson.description}
        `;
        
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text();

        // Update your state
        setVideoData({ 
          title: rawJson.title, 
          summary: summaryText, 
          thumbnail: highResThumbnailUrl 
        });
        
    } catch (err) {
      console.error(err);
      setVideoData({ title: "Error", summary: "Failed to process.", thumbnail: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-20 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Input Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 mb-10">
          <h1 className="text-2xl font-black mb-6 text-blue-600">🚀 Video Insights Pro</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              className="flex-1 p-4 bg-slate-50 border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none transition-all"
              placeholder="Paste YouTube Link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={generateSummary}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:bg-slate-300"
            >
              {loading ? "Analyzing..." : "Get Insights"}
            </button>
          </div>
        </div>

        {/* Result Section */}
        {videoData.title && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Left Column: Thumbnail & Title */}
            <div className="md:col-span-1 space-y-4">
            {videoData.thumbnail && (
  <div className="overflow-hidden rounded-2xl shadow-lg border-4 border-white aspect-video bg-gray-200">
    <img 
      src={videoData.thumbnail} 
      alt={videoData.title || "Video Thumbnail"} 
      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
    />
  </div>
)}
              <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                {videoData.title}
              </h2>
            </div>

            {/* Right Column: Summary Card */}
            <div className="md:col-span-2">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 h-full">
                <div className="text-[10px] font-bold text-blue-400 tracking-widest uppercase mb-4">
                  Gemini AI Summary
                </div>
                <div className="prose prose-blue max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {videoData.summary}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}