import type { Request, Response } from 'express';
import * as memberService from '../services/memberService.js';

export async function getAllMembers(req: Request, res: Response) {
  try {
    const members = await memberService.getAllMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
}

export async function getMemberById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const member = await memberService.getMemberById(id);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
}

export async function createMember(req: Request, res: Response) {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
}

export async function updateMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const member = await memberService.updateMember(id, req.body);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
}

export async function deleteMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await memberService.deleteMember(id);
    if (!success) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
}

export async function confirmMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const member = await memberService.confirmMember(id);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm member' });
  }
}
