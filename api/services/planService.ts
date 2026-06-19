import { readJsonFile, writeJsonFile, generateId } from '../storage/jsonFileStorage.js';
import type { Plan, Dish } from '../../shared/types.js';

export async function getAllPlans(): Promise<Plan[]> {
  return readJsonFile<Plan[]>('plans.json');
}

export async function getPlanById(id: string): Promise<Plan | undefined> {
  const plans = await getAllPlans();
  return plans.find(p => p.id === id);
}

export async function createPlan(planData: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
  const plans = await getAllPlans();
  const newPlan: Plan = {
    ...planData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  await writeJsonFile('plans.json', plans);
  return newPlan;
}

export async function updatePlan(id: string, planData: Partial<Plan>): Promise<Plan | undefined> {
  const plans = await getAllPlans();
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  
  plans[index] = { ...plans[index], ...planData };
  await writeJsonFile('plans.json', plans);
  return plans[index];
}

export async function deletePlan(id: string): Promise<boolean> {
  const plans = await getAllPlans();
  const filtered = plans.filter(p => p.id !== id);
  if (filtered.length === plans.length) return false;
  
  await writeJsonFile('plans.json', filtered);
  return true;
}

export async function addDish(planId: string, dishData: Omit<Dish, 'id'>): Promise<Dish | undefined> {
  const plan = await getPlanById(planId);
  if (!plan) return undefined;
  
  const newDish: Dish = {
    ...dishData,
    id: generateId(),
  };
  
  const updatedDishes = [...plan.dishes, newDish];
  await updatePlan(planId, { dishes: updatedDishes });
  return newDish;
}

export async function updateDish(planId: string, dishId: string, dishData: Partial<Dish>): Promise<Dish | undefined> {
  const plan = await getPlanById(planId);
  if (!plan) return undefined;
  
  const dishIndex = plan.dishes.findIndex(d => d.id === dishId);
  if (dishIndex === -1) return undefined;
  
  plan.dishes[dishIndex] = { ...plan.dishes[dishIndex], ...dishData };
  await updatePlan(planId, { dishes: plan.dishes });
  return plan.dishes[dishIndex];
}

export async function deleteDish(planId: string, dishId: string): Promise<boolean> {
  const plan = await getPlanById(planId);
  if (!plan) return false;
  
  const filteredDishes = plan.dishes.filter(d => d.id !== dishId);
  if (filteredDishes.length === plan.dishes.length) return false;
  
  await updatePlan(planId, { dishes: filteredDishes });
  return true;
}

export async function getSeating(planId: string): Promise<{ planId: string; tables: any[] } | undefined> {
  try {
    const seating = await readJsonFile<{ planId: string; tables: any[] }>(`seating/${planId}.json`);
    return seating;
  } catch {
    return undefined;
  }
}

export async function saveSeating(planId: string, tables: any[]): Promise<void> {
  await writeJsonFile(`seating/${planId}.json`, { planId, tables });
}
