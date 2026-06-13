import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "@/store";
import PlantForm from "@/components/plant/PlantForm";

export default function PlantEdit() {
  const { id } = useParams<{ id: string }>();
  const plant = useStore((s) => s.getPlantById(id || ""));

  if (!plant) {
    return <div className="text-center py-16 text-forest-500">未找到该绿植</div>;
  }

  return <PlantForm plant={plant} mode="edit" />;
}
