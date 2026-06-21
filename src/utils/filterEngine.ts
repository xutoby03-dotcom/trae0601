import type { Fabric, FilterCriteria } from '@/types';

export const filterFabrics = (fabrics: Fabric[], criteria: FilterCriteria): Fabric[] => {
  return fabrics.filter((fabric) => {
    if (criteria.season && criteria.season.length > 0) {
      if (!criteria.season.includes(fabric.season) && fabric.season !== 'all') {
        return false;
      }
    }

    if (criteria.search && criteria.search.trim()) {
      const searchLower = criteria.search.toLowerCase();
      const matchesSearch = 
        fabric.name.toLowerCase().includes(searchLower) ||
        fabric.composition.toLowerCase().includes(searchLower) ||
        (fabric.notes?.toLowerCase().includes(searchLower) ?? false);
      if (!matchesSearch) return false;
    }

    if (criteria.weightMin !== undefined && fabric.weight < criteria.weightMin) return false;
    if (criteria.weightMax !== undefined && fabric.weight > criteria.weightMax) return false;

    if (criteria.elasticityMin !== undefined && fabric.elasticity < criteria.elasticityMin) return false;
    if (criteria.elasticityMax !== undefined && fabric.elasticity > criteria.elasticityMax) return false;

    if (criteria.drapeMin !== undefined && fabric.drape < criteria.drapeMin) return false;
    if (criteria.drapeMax !== undefined && fabric.drape > criteria.drapeMax) return false;

    if (criteria.thicknessMin !== undefined && fabric.thickness < criteria.thicknessMin) return false;
    if (criteria.thicknessMax !== undefined && fabric.thickness > criteria.thicknessMax) return false;

    if (criteria.translucencyMin !== undefined && fabric.translucency < criteria.translucencyMin) return false;
    if (criteria.translucencyMax !== undefined && fabric.translucency > criteria.translucencyMax) return false;

    if (criteria.softnessMin !== undefined && fabric.softness < criteria.softnessMin) return false;
    if (criteria.softnessMax !== undefined && fabric.softness > criteria.softnessMax) return false;

    if (criteria.stiffnessMin !== undefined && fabric.stiffness < criteria.stiffnessMin) return false;
    if (criteria.stiffnessMax !== undefined && fabric.stiffness > criteria.stiffnessMax) return false;

    if (criteria.roughnessMin !== undefined && fabric.roughness < criteria.roughnessMin) return false;
    if (criteria.roughnessMax !== undefined && fabric.roughness > criteria.roughnessMax) return false;

    if (criteria.coolnessMin !== undefined && fabric.coolness < criteria.coolnessMin) return false;
    if (criteria.coolnessMax !== undefined && fabric.coolness > criteria.coolnessMax) return false;

    return true;
  });
};
