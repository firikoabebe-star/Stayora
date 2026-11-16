"use client";

import { motion } from "framer-motion";
import {
  Home,
  Building,
  TreePine,
  Waves,
  Mountain,
  Castle,
  Tent,
  Plane,
} from "lucide-react";
import { useThemeClasses } from "@/lib/theme";

const categories = [
  { icon: Home, name: "Houses", count: "2,340" },
  { icon: Building, name: "Apartments", count: "1,890" },
  { icon: TreePine, name: "Cabins", count: "567" },
  { icon: Waves, name: "Beachfront", count: "890" },
  { icon: Mountain, name: "Mountain", count: "445" },
  { icon: Castle, name: "Castles", count: "123" },
  { icon: Tent, name: "Camping", count: "234" },
  { icon: Plane, name: "Unique Stays", count: "678" },
];

export function Categories() {
  const theme = useThemeClasses();

  return (
    <section className={`py-16 ${theme.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} mb-4`}>
            Browse by Category
          </h2>
          <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto`}>
            Find the perfect type of accommodation for your travel style
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div
                  className={`${theme.backgroundSecondary} rounded-2xl p-6 text-center hover:${theme.cardHover} transition-all duration-300 group-hover:shadow-lg`}
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-semibold ${theme.text} mb-1`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm ${theme.textMuted}`}>
                    {category.count} properties
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            className={`${theme.button} px-8 py-3 rounded-lg transition-colors font-medium text-lg`}
          >
            Explore All Categories
          </button>
        </motion.div>
      </div>
    </section>
  );
}
