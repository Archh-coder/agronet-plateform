import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

import Crop from '../models/Crop.js'
import User from '../models/User.js'

const farmers = [
  { name: 'Ramesh Yadav',    email: 'ramesh@demo.com',   password: 'demo1234', role: 'farmer', phone: '9876543210' },
  { name: 'Priya Patel',     email: 'priya@demo.com',    password: 'demo1234', role: 'farmer', phone: '9876543211' },
  { name: 'Suresh Kumar',    email: 'suresh@demo.com',   password: 'demo1234', role: 'farmer', phone: '9876543212' },
  { name: 'Lakshmi Devi',    email: 'lakshmi@demo.com',  password: 'demo1234', role: 'farmer', phone: '9876543213' },
  { name: 'Vijay Sawant',    email: 'vijay@demo.com',    password: 'demo1234', role: 'farmer', phone: '9876543214' },
  { name: 'Anand Reddy',     email: 'anand@demo.com',    password: 'demo1234', role: 'farmer', phone: '9876543215' },
]

const buyers = [
  { name: 'Arjun Mehta',    email: 'arjun@demo.com',   password: 'buyer1234', role: 'buyer', phone: '9800000001' },
  { name: 'Sneha Sharma',   email: 'sneha@demo.com',   password: 'buyer1234', role: 'buyer', phone: '9800000002' },
  { name: 'Rohit Jain',     email: 'rohit@demo.com',   password: 'buyer1234', role: 'buyer', phone: '9800000003' },
]

// farmerIndex — which farmer (0–5) owns this crop
const cropData = [
  
  // Farmer 0 - Ramesh Yadav (Grains + Vegetables + Fruits)
  { farmerIndex: 0, name: "Wheat",            category: "Grains",     pricePerUnit: 22,  stock: 5000, minOrderQty: 100, images: ["https://images.pexels.com/photos/13100795/pexels-photo-13100795.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Premium wheat from Punjab. Ideal for flour mills and food processing." },
  { farmerIndex: 0, name: "Spinach",          category: "Vegetables", pricePerUnit: 20,  stock: 500,  minOrderQty: 10,  images: ["https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Fresh spinach from Himachal Pradesh. Rich in iron, packed daily." },
  { farmerIndex: 0, name: "Watermelon",       category: "Fruits",     pricePerUnit: 10,  stock: 2000, minOrderQty: 50,  images: ["https://images.pexels.com/photos/35068607/pexels-photo-35068607.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Seedless watermelon from Karnataka. Ideal for juice bars and retail." },

  // Farmer 1 - Priya Patel (Vegetables + Pulses + Spices)
  { farmerIndex: 1, name: "Tomato",           category: "Vegetables", pricePerUnit: 18,  stock: 800,  minOrderQty: 20,  images: ["https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400s"], description: "Hybrid tomatoes from Maharashtra. Firm texture, suitable for processing." },
  { farmerIndex: 1, name: "Moong Dal",        category: "Pulses",     pricePerUnit: 88,  stock: 900,  minOrderQty: 20,  images: ["https://images.pexels.com/photos/7420815/pexels-photo-7420815.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Green gram from Rajasthan. Machine cleaned, ready for packaging." },
  { farmerIndex: 1, name: "Coriander Seeds",  category: "Spices",     pricePerUnit: 55,  stock: 350,  minOrderQty: 10,  images: ["https://images.pexels.com/photos/10487771/pexels-photo-10487771.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Sun-dried coriander from Rajasthan. Bold flavour, export grade." },

  // Farmer 2 - Suresh Kumar (Grains + Fruits + Pulses)
  { farmerIndex: 2, name: "Rice (Basmati)",   category: "Grains",     pricePerUnit: 58,  stock: 3000, minOrderQty: 50,  images: ["https://images.pexels.com/photos/8108170/pexels-photo-8108170.jpeg?auto=compress&cs=tinysrgb&w=40"], description: "Long grain basmati from Haryana. Aromatic, export quality." },
  { farmerIndex: 2, name: "Papaya",           category: "Fruits",     pricePerUnit: 22,  stock: 700,  minOrderQty: 20,  images: ["https://images.pexels.com/photos/5507722/pexels-photo-5507722.jpeg?auto=compress&cs=tinysrgb&w=400"
  ], description: "Sweet papaya from Andhra Pradesh. Uniform size, long shelf life." },
  { farmerIndex: 2, name: "Chana Dal",        category: "Pulses",     pricePerUnit: 72,  stock: 1500, minOrderQty: 25,  images: ["https://images.pexels.com/photos/14965274/pexels-photo-14965274.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Split chickpeas from Madhya Pradesh. Clean, sorted, ready to package." },

  // Farmer 3 - Lakshmi Devi (Spices + Grains + Vegetables)
  { farmerIndex: 3, name: "Turmeric",         category: "Spices",     pricePerUnit: 95,  stock: 600,  minOrderQty: 10,  images: ["https://images.pexels.com/photos/6220710/pexels-photo-6220710.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "High curcumin turmeric from Andhra Pradesh. Certified organic." },
  { farmerIndex: 3, name: "Maize",            category: "Grains",     pricePerUnit: 19,  stock: 3500, minOrderQty: 100, images: ["https://images.pexels.com/photos/7877994/pexels-photo-7877994.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Yellow maize from Karnataka. Used for poultry feed and starch." },
  { farmerIndex: 3, name: "Cauliflower",      category: "Vegetables", pricePerUnit: 15,  stock: 600,  minOrderQty: 20,  images: ["https://images.pexels.com/photos/31508561/pexels-photo-31508561.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "White cauliflower from Punjab. Dense heads, ideal for retail and processing." },

  // Farmer 4 - Vijay Sawant (Fruits + Spices + Pulses)
  { farmerIndex: 4, name: "Mango (Alphonso)", category: "Fruits",     pricePerUnit: 120, stock: 400,  minOrderQty: 10,  images: ["https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "GI tagged Alphonso mangoes from Ratnagiri. High export demand." },
  { farmerIndex: 4, name: "Ginger",           category: "Spices",     pricePerUnit: 65,  stock: 400,  minOrderQty: 10,  images: ["https://images.pexels.com/photos/10112136/pexels-photo-10112136.jpeg?auto=compress&cs=tinysrgb&w=400s"], description: "Fresh ginger from Kerala. Strong aroma, used in food and pharma." },
  { farmerIndex: 4, name: "Chickpea (Whole)", category: "Pulses",     pricePerUnit: 68,  stock: 1000, minOrderQty: 25,  images: ["https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Whole kabuli chana from Madhya Pradesh. Premium grade for export." },

  // Farmer 5 - Anand Reddy (Vegetables + Fruits + Pulses)
  { farmerIndex: 5, name: "Onion",            category: "Vegetables", pricePerUnit: 14,  stock: 2000, minOrderQty: 50,  images: ["https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Red onions from Nashik. Bulk available, top export quality." },
  { farmerIndex: 5, name: "Pomegranate",      category: "Fruits",     pricePerUnit: 85,  stock: 500,  minOrderQty: 20,  images: ["https://images.pexels.com/photos/29310030/pexels-photo-29310030.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Bhagwa pomegranate from Solapur. Deep red arils, high juice content." },
  { farmerIndex: 5, name: "Lentils (Masoor)", category: "Pulses",     pricePerUnit: 78,  stock: 1200, minOrderQty: 25,  images: ["https://images.pexels.com/photos/34940646/pexels-photo-34940646.jpeg?auto=compress&cs=tinysrgb&w=400"], description: "Red masoor dal from Uttar Pradesh. Sorted and packed, ready to retail." },
]


const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_db_URL)
    console.log('✅ Connected to MongoDB')

    // ✅ this line already exists — it catches both farmers and buyers since all use @demo.com
    await User.deleteMany({ email: { $regex: '@demo.com' } })
    await Crop.deleteMany({})
    console.log('🗑️  Cleared demo farmers, buyers and all crops')

    // farmers (already exists)
    const hashedFarmers = await Promise.all(
      farmers.map(async (f) => ({
        ...f,
        password: await bcrypt.hash(f.password, 10),
        isVerified: true
      }))
    )
    const createdFarmers = await User.insertMany(hashedFarmers)
    console.log(`👤 Created ${createdFarmers.length} demo farmers`)

    // 👇 ADD THIS BLOCK right here, after farmers
    const hashedBuyers = await Promise.all(
      buyers.map(async (b) => ({
        ...b,
        password: await bcrypt.hash(b.password, 10),
        isVerified: true
      }))
    )
    const createdBuyers = await User.insertMany(hashedBuyers)
    console.log(`🛒 Created ${createdBuyers.length} demo buyers`)

    // crops (already exists)
    const cropsWithFarmer = cropData.map(({ farmerIndex, ...crop }) => ({
      ...crop,
      farmerId: createdFarmers[farmerIndex]._id
    }))
    await Crop.insertMany(cropsWithFarmer)
    console.log('🌱 12 crops seeded!')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()