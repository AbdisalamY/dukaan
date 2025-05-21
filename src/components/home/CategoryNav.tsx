// components/home/CategoryNav.tsx
"use client";

import { useState } from "react";

interface CategoryNavProps {
  categories: string[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar">
        <span className="text-xs text-gray-400 mr-2 min-w-max">Trending searches</span>
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-5 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${activeCategory === category
                ? "bg-purple-100 text-purple-700 shadow"
                : "bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600"}
            `}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}