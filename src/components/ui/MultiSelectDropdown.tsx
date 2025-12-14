import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, X, Search } from "lucide-react";

interface Option {
  id: string;
  name: string;
  unit?: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onToggle,
  placeholder = "Chọn items...",
  emptyMessage = "Chưa có dữ liệu"
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));

  // 🔍 FILTER OPTIONS
  const filteredOptions = useMemo(() => {
    return options.filter(opt =>
      opt.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ================= BUTTON ================= */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 focus:ring-2 focus:ring-red-200 outline-none"
      >
        <div className="flex-1 text-left">
          {selectedIds.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.slice(0, 2).map(opt => (
                <span
                  key={opt.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                >
                  {opt.name}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(opt.id);
                    }}
                  />
                </span>
              ))}
              {selectedIds.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  +{selectedIds.length - 2} khác
                </span>
              )}
            </div>
          )}
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>

      {/* ================= DROPDOWN ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg"
          >
            {/* 🔍 SEARCH BAR */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm cảm biến..."
                  className="w-full pl-10 pr-3 py-1.5 text-sm border rounded 
             focus:ring-2 focus:ring-red-200 outline-none"
                />
              </div>
            </div>

            {/* ================= LIST ================= */}
            <div className="max-h-56 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  {emptyMessage}
                </p>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredOptions.map((option, index) => {
                    const isSelected = selectedIds.includes(option.id);
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => onToggle(option.id)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition-all duration-200 ${
                          isSelected
                            ? "bg-red-50 border-red-200 shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <motion.div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                              isSelected
                                ? "bg-red-600 border-red-600"
                                : "border-gray-300 bg-white"
                            }`}
                            animate={{
                              scale: isSelected ? [1, 1.2, 1] : 1,
                              rotate: isSelected ? [0, 10, 0] : 0
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          <div className="text-sm flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${
                                isSelected ? "text-red-900" : "text-gray-700"
                              }`}
                            >
                              {option.name}
                            </p>
                            {option.unit && (
                              <p className="text-[10px] text-gray-500">
                                Đơn vị: {option.unit}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
