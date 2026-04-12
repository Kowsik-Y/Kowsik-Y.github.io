"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface FilterDropdownProps {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
  label?: string;
  allLabel?: string;
}

export function FilterDropdown({
  options,
  activeOption,
  onSelect,
  label = "Filter",
  allLabel = "All",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setTimeout(() => setSearch(""), 0); // Reset search when closed
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt =>
    opt === "all" || opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative z-20 w-full sm:w-[320px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full ui-surface flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 shadow-xs text-sm font-medium hover:border-border transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-foreground truncate w-full text-left">
            {activeOption === "all" ? allLabel : activeOption}
          </span>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full ui-surface rounded-xl border border-border/60 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="p-2 border-b border-border/50 relative flex items-center">
            <Search size={14} className="absolute left-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <ul 
            className="max-h-[280px] overflow-y-auto p-1 custom-scrollbar" 
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="p-3 text-center text-sm text-muted-foreground">No tags found</li>
            ) : (
              filteredOptions.map((opt) => {
                const selected = activeOption === opt;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(opt);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected 
                          ? "bg-violet-600/10 text-violet-700 dark:text-violet-300 font-medium" 
                          : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      <span className="truncate">{opt === "all" ? allLabel : opt}</span>
                      {selected && <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
