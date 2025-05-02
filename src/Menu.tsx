import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from './config';
import axios from 'axios';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
}

const categoryOrder = ["appetizer", "main course", "drink", "snack", "dessert"];

const categoryIcons: Record<string, string> = {
  // Icons for each category
  appetizer: "🥟",
  "main course": "🍽️",
  drink: "🥤",
  snack: "🍟",
  dessert: "🍰",
};

const formatCategoryName = (str: string) => {
  // Convert hyphenated names to space-separated and capitalize each word
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Menu: React.FC = () => {
  // Define the state variables for menu items, loading state, and error handling
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is an admin
    const fetchAllMenuItems = async () => {
      let allItems: MenuItem[] = [];
      let url = '/api/menu-items/';
    
      try {
        while (url) {
          const response = await axios.get(`${API_BASE}${url}`);
          allItems = [...allItems, ...response.data.results];
          url = response.data.next ? response.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : ''; // adjust next page URL
        }
    
        setMenuItems(allItems);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchAllMenuItems();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  const groupedItems = menuItems.reduce((groups: Record<string, MenuItem[]>, item) => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
    return groups;
  }, {});
  
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  return (
    <div className="flex justify-center p-4">
      <div className="max-w-6xl w-full">
        {Object.keys(groupedItems)
          .sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.toLowerCase());
            const indexB = categoryOrder.indexOf(b.toLowerCase());
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          })
          .map((type) => (
            <motion.div
              key={type}
              className="mb-12"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <span>{categoryIcons[type.toLowerCase()]}</span>
                <span>{formatCategoryName(type)}</span>
              </h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groupedItems[type].map((item) => (
                  <div 
                    key={item.id} 
                    className="p-6 border rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 bg-white"
                  >
                    <h3 className="text-xl font-semibold mb-2">{capitalizeFirstLetter(item.name)}</h3>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <p className="text-lg font-bold">{item.price} €</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default Menu;
