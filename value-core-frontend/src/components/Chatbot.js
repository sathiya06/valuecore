import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Bot, Send} from 'lucide-react';

const Chatbot = ({ uiContext, updateField }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: "Hello! I can answer questions and update your ROI fields." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

// Function to call your backend API
const fetchLLMResponse = async (userMessage) => {
  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, ui_context:uiContext })
    });

    if (!res.ok) throw new Error("Failed to fetch from backend");

    // Expecting backend to return { answer, action, confidence }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching LLM response:", err);
    return {
      answer: "Oops! I couldn't reach the server.",
      action: null,
      confidence: 0
    };
  }
};

// Action handler to interpret and execute LLM commands
const handleAction = (action) => {
  if (!action || !Array.isArray(action)) return;

  // Loop through each field-value pair
  action.forEach(([field, value]) => {
    updateField(field, value); // call your existing updateField function
  });
};

// Chat sending logic
const handleSend = async () => {
  if (!input.trim()) return;

  const userMsg = { id: messages.length + 1, type: "user", content: input };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsTyping(true);

  // Call Flask API instead of local mock
  const response =  await fetchLLMResponse(input);

  // Execute UI action if provided by LLM
  if (response.action) handleAction(response.action);

  setMessages((prev) => [
    ...prev,
    { id: messages.length + 2, type: "bot", content: response.answer }
  ]);
  setIsTyping(false);

  // Display bot response
  // setTimeout(() => {
  //   setMessages((prev) => [
  //     ...prev,
  //     { id: messages.length + 2, type: "bot", content: response.answer }
  //   ]);
  //   setIsTyping(false);
  // }, 5000);
};


  return (
    <div className="bg-white rounded-lg shadow-md h-fit p-4">
      <h3 className="text-lg font-semibold flex items-center"><Bot className="mr-2 text-blue-600" />AI Copilot</h3>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto mt-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${m.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>{m.content}</div>
          </div>
        ))}
        {isTyping && <div className="text-gray-500 text-sm">AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows="2" className="flex-1 border rounded p-2" placeholder="Ask about ROI or update values..." />
        <button onClick={handleSend} className="bg-blue-600 text-white px-3 rounded"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

Chatbot.propTypes = {
  uiContext: PropTypes.object.isRequired,
  updateField: PropTypes.func.isRequired
};

export default Chatbot;
