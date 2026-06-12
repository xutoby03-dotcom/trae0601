import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { ChevronDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function ElderSelector() {
  const navigate = useNavigate();
  const { profiles, selectedElderId, setSelectedElderId } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedElder = profiles.find((p) => p.id === selectedElderId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedElder && profiles.length === 0) {
    return (
      <button
        onClick={() => navigate("/profiles/new")}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
      >
        <UserPlus className="w-5 h-5" />
        添加老人档案
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors min-w-[200px]"
      >
        {selectedElder && (
          <>
            <img
              src={selectedElder.avatar}
              alt={selectedElder.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 text-sm">{selectedElder.name}</p>
              <p className="text-xs text-gray-500">{selectedElder.age}岁</p>
            </div>
          </>
        )}
        <ChevronDown
          className={cn("w-4 h-4 text-gray-500 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl border border-gray-100 shadow-card-hover overflow-hidden z-50 animate-fade-in">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                setSelectedElderId(profile.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                profile.id === selectedElderId && "bg-primary-50"
              )}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.age}岁</p>
              </div>
              {profile.id === selectedElderId && (
                <div className="w-2 h-2 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
          <button
            onClick={() => {
              navigate("/profiles/new");
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 border-t border-gray-50 text-primary-600 hover:bg-primary-50 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            添加新档案
          </button>
        </div>
      )}
    </div>
  );
}
