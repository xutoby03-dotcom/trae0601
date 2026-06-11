import type { Pet, Medicine, FeedingRecord } from '@/types';
import { generateId, getTodayStr, addDays } from './date';

const STORAGE_KEY = 'pet-medicine-calendar-data';

interface StoredData {
  pets: Pet[];
  medicines: Medicine[];
  feedingRecords: FeedingRecord[];
}

export const loadFromStorage = (): StoredData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load from storage', e);
  }
  return null;
};

export const saveToStorage = (data: StoredData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
};

export const generateMockData = (): StoredData => {
  const today = getTodayStr();
  
  const pets: Pet[] = [
    {
      id: 'pet1',
      name: '橘猫',
      species: '橘猫',
      weight: 5.2,
      allergies: '青霉素过敏',
      hospital: '爱宠动物医院',
      photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20portrait%20photo&image_size=square',
      createdAt: addDays(today, -30),
    },
    {
      id: 'pet2',
      name: '豆豆',
      species: '柯基',
      weight: 12.5,
      allergies: '无',
      hospital: '汪星人宠物医院',
      photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20welsh%20corgi%20dog%20portrait%20photo&image_size=square',
      createdAt: addDays(today, -60),
    },
  ];

  const medicines: Medicine[] = [
    {
      id: 'med1',
      petId: 'pet1',
      name: '阿莫西林',
      dosage: '半片',
      frequency: 2,
      durationDays: 7,
      mealTiming: 'after',
      remainingQuantity: 20,
      doctorNote: '感冒消炎药，连续服用7天',
      startDate: addDays(today, -2),
      timeSlots: ['08:00', '20:00'],
      createdAt: addDays(today, -2),
    },
    {
      id: 'med2',
      petId: 'pet1',
      name: '益生菌',
      dosage: '1袋',
      frequency: 1,
      durationDays: 14,
      mealTiming: 'after',
      remainingQuantity: 30,
      doctorNote: '调理肠胃',
      startDate: addDays(today, -5),
      timeSlots: ['09:00'],
      createdAt: addDays(today, -5),
    },
    {
      id: 'med3',
      petId: 'pet2',
      name: '钙片',
      dosage: '2片',
      frequency: 2,
      durationDays: 30,
      mealTiming: 'any',
      remainingQuantity: 100,
      doctorNote: '日常补钙',
      startDate: addDays(today, -10),
      timeSlots: ['08:30', '20:30'],
      createdAt: addDays(today, -10),
    },
  ];

  const feedingRecords: FeedingRecord[] = [];
  
  for (let dayOffset = -2; dayOffset < 0; dayOffset++) {
    const date = addDays(today, dayOffset);
    
    medicines.forEach(med => {
      med.timeSlots.forEach(timeSlot => {
        feedingRecords.push({
          id: generateId(),
          medicineId: med.id,
          date,
          timeSlot,
          status: Math.random() > 0.1 ? 'fed' : 'missed',
          reaction: 'normal',
          note: '',
          fedAt: new Date(date + 'T' + timeSlot).toISOString(),
        });
      });
    });
  }

  return { pets, medicines, feedingRecords };
};
