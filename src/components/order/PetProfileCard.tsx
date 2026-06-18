import {
  Scale,
  PawPrint,
  Sparkles,
  AlertTriangle,
  MessageCircleHeart,
} from "lucide-react";
import { Pet, HAIR_LENGTH_META } from "@/types";

interface PetProfileCardProps {
  pet: Pet;
}

export default function PetProfileCard({ pet }: PetProfileCardProps) {
  return (
    <div className="card p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl">
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-brown-900">
                {pet.name}
              </h2>
              <p className="text-brown-700/70 mt-0.5">{pet.breed}</p>
            </div>
            <span className="chip bg-primary-50 text-primary-600 border border-primary-100">
              <Sparkles className="w-3 h-3" />
              {HAIR_LENGTH_META[pet.hairLength]}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-cream-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-brown-700/60 text-xs mb-1">
                <Scale className="w-3.5 h-3.5" />
                体重
              </div>
              <p className="font-semibold text-brown-900">{pet.weight} kg</p>
            </div>

            <div className="bg-cream-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-brown-700/60 text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                毛发
              </div>
              <p className="font-semibold text-brown-900">
                {HAIR_LENGTH_META[pet.hairLength]}
              </p>
            </div>

            <div className="bg-cream-50 rounded-xl p-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-brown-700/60 text-xs mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                过敏项
              </div>
              <p className="font-semibold text-brown-900 text-sm break-words">
                {pet.allergies.join("、")}
              </p>
            </div>

            <div className="bg-cream-50 rounded-xl p-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-brown-700/60 text-xs mb-1">
                <MessageCircleHeart className="w-3.5 h-3.5 text-primary-500" />
                脾气
              </div>
              <p className="font-semibold text-brown-900 text-sm break-words">
                {pet.temperament}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
