import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const app = express();
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise_ecommerce';

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

export const PRODUCTS = [
  {
    id: "prod-1",
    name: "Aura Pro Wireless Headphones",
    price: 249.99,
    description: "Active noise-canceling over-ear headphones with 40-hour battery life and spatial audio.",
    category: "Electronics",
    stock: 15,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
  },
  {
    id: "prod-2",
    name: "ErgoDesk Mechanical Keyboard",
    price: 129.50,
    description: "Custom mechanical keyboard with hot-swappable tactile switches and RGB backlighting.",
    category: "Electronics",
    stock: 8,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80"
  },
  {
    id: "prod-3",
    name: "Minimalist Leather Backpack",
    price: 89.00,
    description: "Water-resistant full-grain leather backpack with a padded 15-inch laptop sleeve.",
    category: "Accessories",
    stock: 22,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
  },
  {
    id: "prod-4",
    name: "ChronoPrecision Smartwatch v2",
    price: 199.99,
    description: "Fitness tracker with AMOLED display, heart rate monitor, sleep tracking, and built-in GPS.",
    category: "Electronics",
    stock: 0,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
  },
  {
    id: "prod-5",
    name: "Ceramic Drip Coffee Maker Set",
    price: 45.00,
    description: "Handcrafted ceramic pour-over coffee dripper with heat-resistant glass carafe.",
    category: "Home & Kitchen",
    stock: 30,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80"
  },
  {
    id: "prod-6",
    name: "Urban Runner Performance Shoes",
    price: 119.99,
    description: "Lightweight breathable mesh running shoes with responsive foam cushioning.",
    category: "Footwear",
    stock: 5,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
  },
  {
    id: "prod-7",
    name: "Studio Monitor Desktop Speakers",
    price: 179.95,
    description: "Active 2-way desktop monitors delivering crystal-clear reference sound for creators.",
    category: "Electronics",
    stock: 12,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80"
  },
  {
    id: "prod-8",
    name: "EcoTherm Insulated Water Bottle",
    price: 28.50,
    description: "Double-wall stainless steel flask that keeps drinks cold for 24 hours or hot for 12 hours.",
    category: "Fitness & Outdoors",
    stock: 45,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80"
  },
  {
    id: "prod-9",
    name: "Ergonomic Mesh Office Chair",
    price: 320.00,
    description: "High-back desk chair with lumbar support, adjustable armrests, and breathable mesh.",
    category: "Furniture",
    stock: 3,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&q=80"
  },
  {
    id: "prod-10",
    name: "4K Ultra-HD Webcam with Ring Light",
    price: 79.99,
    description: "Autofocus web camera with dual noise-canceling microphones for streaming and meetings.",
    category: "Electronics",
    stock: 19,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&q=80"
  },
  {
    id: "prod-11",
    name: "Organic Cotton Oversized Hoodie",
    price: 65.00,
    description: "Heavyweight 100% organic cotton hoodie with brushed fleece interior for ultimate comfort.",
    category: "Apparel",
    stock: 14,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"
  },
  {
    id: "prod-12",
    name: "Smart RGB Ambient Desk Lamp",
    price: 49.99,
    description: "App-controlled LED desk lamp with customizable lighting scenes and wireless phone charger.",
    category: "Home & Kitchen",
    stock: 25,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"
  }
];

app.get('/api/v1/products', (_req: Request, res: Response) => {
  res.json({ success: true, data: PRODUCTS });
});

app.get('/api/v1/products/:id', (req: Request, res: Response) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
  })
  .catch((_err) => {
    console.log(`MongoDB Offline. Running fallback Product Service on port ${PORT}`);
    app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
  });
