/**
 * src/lib/data.ts
 * الحل الجذري لمشكلة id:
 * توحيد Product.id ليكون number في المشروع كله
 */

import headphones from "@/assets/product-headphones.jpg";
import watch from "@/assets/product-watch.jpg";
import laptop from "@/assets/product-laptop.jpg";
import phone from "@/assets/product-phone.jpg";
import speaker from "@/assets/product-speaker.jpg";
import keyboard from "@/assets/product-keyboard.jpg";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AuraSound Headphones",
    category: "Audio",
    price: 149,
    image: headphones,
    description:
      "Premium wireless over-ear headphones with active noise cancellation.",
    stock: 24,
  },
  {
    id: 2,
    name: "PulseTime Smart Watch",
    category: "Wearables",
    price: 219,
    image: watch,
    description:
      "Health tracking smart watch with always-on AMOLED display.",
    stock: 18,
  },
  {
    id: 3,
    name: "ProBook Air 14",
    category: "Computers",
    price: 1299,
    image: laptop,
    description:
      "Ultra-thin laptop with 18-hour battery and secure enclave chip.",
    stock: 9,
  },
  {
    id: 4,
    name: "Nova X Smartphone",
    category: "Mobile",
    price: 799,
    image: phone,
    description:
      "Flagship phone with end-to-end encrypted messaging built in.",
    stock: 32,
  },
  {
    id: 5,
    name: "Echo Mini Speaker",
    category: "Audio",
    price: 89,
    image: speaker,
    description:
      "Portable Bluetooth speaker with 360° sound and 20-hour battery.",
    stock: 41,
  },
  {
    id: 6,
    name: "CyberKey RGB Keyboard",
    category: "Computers",
    price: 159,
    image: keyboard,
    description:
      "Mechanical RGB keyboard with hot-swap switches and aluminum frame.",
    stock: 15,
  },
];

export const TEAM = [
  {
    name: "Mohannad Madyan Mohammed",
    role: "Team Lead & Threat Modeling",
    initials: "MM",
  },
  {
    name: "Abdulraheem Ameen",
    role: "Frontend & Secure UI Forms",
    initials: "AA",
  },
  {
    name: "ALBARA AMMAR YASER",
    role: "RASP & Logging Engineer",
    initials: "BA",
  },
  {
    name: "Loai Napil Abdallah",
    role: "SAST / DAST & SCA Analyst",
    initials: "LN",
  },
];

export const TECHNOLOGIES = [
  "React 19",
  "TypeScript",
  "TanStack Router",
  "Tailwind CSS v4",
  "Zod (input validation)",
  "shadcn/ui",
  "Lucide Icons",
  "Vite 7",
];