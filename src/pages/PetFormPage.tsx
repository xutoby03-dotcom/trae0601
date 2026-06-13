import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PetForm from "../components/PetForm";

export default function PetFormPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-6 pb-20">
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white transition-colors text-ink-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-ink-800">
          宠物档案
        </h1>
      </div>
      <PetForm />
    </div>
  );
}
