import MapFilterBar from "@/components/map/MapFilterBar";
import MapCanvas from "@/components/map/MapCanvas";

export default function MapView() {
  return (
    <div className="relative flex h-full w-full">
      <MapCanvas />
      <MapFilterBar />
    </div>
  );
}
