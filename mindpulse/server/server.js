const path = require('path');
// Force load .env from the server directory to avoid path issues
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');

// Import Models
const User = require('./models/User');
const Entry = require('./models/Entry');
const Group = require('./models/Group');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindpulse';
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,
  family: 4, 
  tls: true,
  // tlsAllowInvalidCertificates: true // Uncomment if needed for dev
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('   -> Check your IP Whitelist in MongoDB Atlas');
  });

// Initialize OpenAI
// Trim removes accidental spaces or quotes that might be in the .env file
const OPENAI_KEY = process.env.API_KEY ? process.env.API_KEY.trim() : ""; 

if (OPENAI_KEY && OPENAI_KEY.length > 10) {
  // Log masked key to help debug
  console.log(`✅ AI Service: OpenAI Key detected (${OPENAI_KEY.substring(0, 8)}...****). AI features ready.`);
} else {
  console.error('❌ AI Service: OpenAI Key MISSING or INVALID in server/.env file.');
  console.error('   -> Please create server/.env and add API_KEY=sk-...');
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (user && user.password === password) {
      return res.json({ user });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, role, groupCode, password } = req.body;
    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = await User.create({
      name,
      email,
      password: password || 'password123',
      role,
      groupId: groupCode.toUpperCase(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });
    res.json({ user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) return res.status(400).json({ error: 'GroupId required' });
    const members = await User.find({ groupId: groupId.toUpperCase() });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- AI ROUTES ---

// 1. Analyze Mood Entry
app.post('/api/ai/analyze', async (req, res) => {
  if (!OPENAI_KEY) return res.status(503).json({ error: "Server missing API_KEY. Check server/.env" });

  try {
    const { note, stressLevel } = req.body;
    console.log(`🧠 AI Analyze Request: Stress ${stressLevel}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      response_format: { type: "json_object" },
      messages: [
        { 
          role: "system", 
          content: `You are an expert mental health AI. Analyze the user's daily note for stress/burnout. 
          Return strict JSON with the following structure:
          {
            "sentimentScore": number (-1 to 1),
            "burnoutRisk": boolean,
            "aiIntervention": string (short helpful tip),
            "tags": string[] (max 3 one-word tags)
          }` 
        },
        { 
          role: "user", 
          content: `User Note: "${note}". User reported stress level: ${stressLevel}/10.` 
        }
      ]
    });

    const content = completion.choices[0].message.content;
    if (content) {
      res.json(JSON.parse(content));
    } else {
      throw new Error("Empty AI response");
    }
  } catch (error) {
    console.error("❌ AI Analysis Failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Chatbot
app.post('/api/ai/chat', async (req, res) => {
  if (!OPENAI_KEY) return res.status(503).json({ error: "Server missing API_KEY. Check server/.env" });

  try {
    const { history, message } = req.body;
    
    // Map Frontend format (role: 'model') to OpenAI format (role: 'assistant')
    // Frontend history: [{ role: 'user'|'model', parts: [{text: '...'}] }] or flat structure depending on service
    // Based on AIChat.tsx, it sends flat history messages usually, let's normalize:
    
    const formattedHistory = (history || []).map(msg => {
      // Handle the complex structure if sent from geminiService logic
      let content = "";
      if (msg.parts && msg.parts[0] && msg.parts[0].text) {
        content = msg.parts[0].text;
      } else if (msg.text) {
        content = msg.text; // fallback if sent flat
      }

      return {
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: content
      };
    });

    // Add current message
    formattedHistory.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a mental health assistant. Be concise, empathetic, and supportive." },
            ...formattedHistory
        ]
    });

    console.log("💬 AI Chat Message Received");
    res.json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ AI Chat Failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Group Report
app.post('/api/ai/report', async (req, res) => {
  if (!OPENAI_KEY) return res.status(503).json({ error: "Server missing API_KEY. Check server/.env" });

  try {
    console.log("📊 Generating Group Report...");
    const { entries } = req.body;
    
    // Minimize token usage by summarizing data
    const summaryData = entries.map(e => ({ s: e.stressLevel, m: e.mood, t: e.tags })); 

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Analyze the following group mood data. 
          Return strict JSON:
          {
            "overallWellnessScore": number (0-100),
            "burnoutRiskLevel": "Low" | "Medium" | "High",
            "summary": string (brief executive summary),
            "recommendations": string[] (3 actionable tips)
          }`
        },
        { role: "user", content: JSON.stringify(summaryData) }
      ]
    });

    const content = completion.choices[0].message.content;
    if (content) {
      const result = JSON.parse(content);
      res.json({ ...result, lastUpdated: new Date().toISOString() });
    } else {
      throw new Error("Empty AI response");
    }
  } catch (error) {
    console.error("❌ Group Report Failed:", error.message);
    res.status(500).json({ error: `Report generation failed: ${error.message}` });
  }
});

// --- DATA ROUTES ---

app.get('/api/entries', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ timestamp: 1 });
    res.json(entries);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/entries', async (req, res) => {
  try {
    const entryData = req.body;
    delete entryData.id; 
    const newEntry = await Entry.create(entryData);
    res.json(newEntry);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;
    let group = await Group.findOne({ groupId: groupId.toUpperCase() });
    
    if (!group) return res.json({ announcement: '', vibes: 0, userVibedToday: false });
    if (!group.vibeHistory) group.vibeHistory = [];

    let userVibedToday = false;
    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      // Force string comparison for robust matching
      userVibedToday = group.vibeHistory.some(h => String(h.userId) === String(userId) && h.date === today);
    }
    
    res.json({ announcement: group.announcement, vibes: group.vibes, userVibedToday });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/groups/:groupId/announcement', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { announcement } = req.body;
    const group = await Group.findOneAndUpdate(
      { groupId: groupId.toUpperCase() },
      { announcement },
      { new: true, upsert: true }
    );
    res.json({ success: true, announcement: group.announcement });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/groups/:groupId/vibes', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    let group = await Group.findOne({ groupId: groupId.toUpperCase() });
    if (!group) {
       group = await Group.create({ groupId: groupId.toUpperCase(), vibes: 1, vibeHistory: [{ userId, date: today }] });
       return res.json({ success: true, vibes: 1 });
    }
    if (!group.vibeHistory) group.vibeHistory = [];

    const alreadyVibed = group.vibeHistory.some(h => String(h.userId) === String(userId) && h.date === today);
    if (alreadyVibed) return res.status(400).json({ error: 'Daily vibe limit reached' });

    group.vibes += 1;
    group.vibeHistory.push({ userId, date: today });
    await group.save();
    res.json({ success: true, vibes: group.vibes });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});