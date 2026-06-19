import type { Request, Response } from 'express';
import * as planService from '../services/planService.js';
import * as memberService from '../services/memberService.js';
import * as seatingService from '../services/seatingService.js';
import { detectConflicts, getHighRiskDishes } from '../services/conflictDetectionService.js';
import * as exportService from '../services/exportService.js';

export async function getAllPlans(req: Request, res: Response) {
  try {
    const plans = await planService.getAllPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
}

export async function getPlanById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
}

export async function createPlan(req: Request, res: Response) {
  try {
    const plan = await planService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
}

export async function updatePlan(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.updatePlan(id, req.body);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
}

export async function deletePlan(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await planService.deletePlan(id);
    if (!success) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
}

export async function addDish(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const dish = await planService.addDish(id, req.body);
    if (!dish) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add dish' });
  }
}

export async function updateDish(req: Request, res: Response) {
  try {
    const { id, dishId } = req.params;
    const dish = await planService.updateDish(id, dishId, req.body);
    if (!dish) {
      res.status(404).json({ error: 'Plan or dish not found' });
      return;
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
}

export async function deleteDish(req: Request, res: Response) {
  try {
    const { id, dishId } = req.params;
    const success = await planService.deleteDish(id, dishId);
    if (!success) {
      res.status(404).json({ error: 'Plan or dish not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
}

export async function generateSeating(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    const members = await memberService.getAllMembers();
    const tables = seatingService.generateSeating(members, plan);
    
    await planService.saveSeating(id, tables);
    res.json({ planId: id, tables });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate seating' });
  }
}

export async function getSeating(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const seating = await planService.getSeating(id);
    
    if (!seating) {
      const plan = await planService.getPlanById(id);
      if (!plan) {
        res.status(404).json({ error: 'Plan not found' });
        return;
      }
      const members = await memberService.getAllMembers();
      const tables = seatingService.generateSeating(members, plan);
      await planService.saveSeating(id, tables);
      res.json({ planId: id, tables });
      return;
    }
    
    res.json(seating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get seating' });
  }
}

export async function saveSeating(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { tables } = req.body;
    await planService.saveSeating(id, tables);
    res.json({ planId: id, tables });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save seating' });
  }
}

export async function getConflicts(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    const seating = await planService.getSeating(id);
    if (!seating) {
      res.json([]);
      return;
    }
    
    const members = await memberService.getAllMembers();
    const conflicts = detectConflicts(plan, seating.tables, members);
    
    res.json(conflicts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect conflicts' });
  }
}

export async function exportRestaurantList(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    const seating = await planService.getSeating(id);
    if (!seating) {
      res.status(400).json({ error: 'Seating not generated yet' });
      return;
    }
    
    const content = await exportService.generateRestaurantList(plan, seating.tables);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const encodedName = encodeURIComponent(`餐厅忌口清单_${plan.name}.txt`);
    res.setHeader('Content-Disposition', `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
    res.send(content);
  } catch (error) {
    console.error('exportRestaurantList error:', error);
    res.status(500).json({ error: 'Failed to export restaurant list', detail: (error as Error).message });
  }
}

export async function exportTableCards(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    
    const seating = await planService.getSeating(id);
    if (!seating) {
      res.status(400).json({ error: 'Seating not generated yet' });
      return;
    }
    
    const content = await exportService.generateTableCards(plan, seating.tables);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const encodedName = encodeURIComponent(`每桌桌签_${plan.name}.txt`);
    res.setHeader('Content-Disposition', `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
    res.send(content);
  } catch (error) {
    console.error('exportTableCards error:', error);
    res.status(500).json({ error: 'Failed to export table cards', detail: (error as Error).message });
  }
}

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const members = await memberService.getAllMembers();
    const plans = await planService.getAllPlans();
    const latestPlan = plans[plans.length - 1];
    
    let conflicts = [];
    let highRiskDishes = 0;
    let budgetDiff = 0;
    let dishesToReplace = 0;
    
    if (latestPlan) {
      const seating = await planService.getSeating(latestPlan.id);
      if (seating) {
        conflicts = detectConflicts(latestPlan, seating.tables, members);
      }
      
      const riskyDishes = getHighRiskDishes(latestPlan.dishes, members);
      highRiskDishes = riskyDishes.length;
      dishesToReplace = riskyDishes.filter(d => {
        const hasAllergyMatch = members.some(m => {
          if (d.hasSeafood && m.allergies.includes('seafood')) return true;
          if (d.hasNuts && m.allergies.includes('nuts')) return true;
          if (d.spiciness !== 'none' && m.allergies.includes('spicy')) return true;
          return false;
        });
        return hasAllergyMatch;
      }).length;
      
      const totalDishPrice = latestPlan.dishes.reduce((sum, d) => sum + d.price, 0);
      const estimatedTotal = totalDishPrice * latestPlan.totalTables;
      budgetDiff = latestPlan.budget - estimatedTotal;
    }
    
    const stats = {
      totalMembers: members.length,
      unconfirmedMembers: members.filter(m => !m.confirmed).length,
      highRiskDishes,
      budgetDiff,
      dishesToReplace,
      pendingConflicts: conflicts,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
}
