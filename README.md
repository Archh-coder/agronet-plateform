# AgroNet - Contract Farming Platform

A MERN stack platform connecting farmers directly with buyers, eliminating middlemen through digital contracts and AI-powered crop recommendations.

## 🌾 Features

- **For Farmers:**
  - List crops with pricing & stock management
  - Receive & manage contract requests
  - Track orders and earnings

- **For Buyers:**
  - Browse crops from multiple farmers
  - Add to cart & create contracts
  - Real-time market prices

- **AI Integration:**
  - CropSense AI - crop recommendations based on soil, climate, region
  - Powered by Groq (Llama 3.3 70B)
  - 15 predictions per user / 2 hours

## 🛠️ Tech Stack

**Frontend:** React, Redux, React Router, Recharts  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Auth:** JWT, bcrypt  
**Storage:** Cloudinary (images)  
**AI:** Groq API (Llama 3.3)  

## 📦 Installation

```bash
# Clone repo
git clone https://github.com/Archh-coder/agronet-plateform.git
cd agronet-plateform

# Install backend
cd Server
npm install

# Install frontend
cd ../client
npm install
```

## 🔑 Environment Variables

Create `Server/.env`:
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret



## 🚀 Run Locally

```bash
# Backend (port 8080)
cd Server
npm start

# Frontend (port 5173)
cd client
npm run dev
```

## 🌱 Seed Database

```bash
cd Server
node config/seedCrops.js
```

Demo login: `ramesh@demo.com` / `demo1234`

## 👥 Team

Samrat Ashok Technological Institute (Engg. College) Vidisha  
Department of Cybersecurity and IoT

## 📄 License

MIT