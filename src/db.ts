import { ClothingItem, Outfit } from './types'

const CLOTHES_KEY = 'wardrobe_clothes'
const OUTFITS_KEY = 'wardrobe_outfits'

function readClothes(): ClothingItem[] {
  try {
    const data = localStorage.getItem(CLOTHES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function writeClothes(items: ClothingItem[]) {
  localStorage.setItem(CLOTHES_KEY, JSON.stringify(items))
}

function readOutfits(): Outfit[] {
  try {
    const data = localStorage.getItem(OUTFITS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function writeOutfits(items: Outfit[]) {
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(items))
}

export const db = {
  getAllClothes: readClothes,

  addClothing(item: ClothingItem) {
    const items = readClothes()
    items.push(item)
    writeClothes(items)
    return item
  },

  updateClothing(item: ClothingItem) {
    const items = readClothes()
    const idx = items.findIndex(c => c.id === item.id)
    if (idx >= 0) {
      items[idx] = item
      writeClothes(items)
    }
    return item
  },

  deleteClothing(id: string) {
    const items = readClothes().filter(c => c.id !== id)
    writeClothes(items)
  },

  getClothingById(id: string): ClothingItem | undefined {
    return readClothes().find(c => c.id === id)
  },

  getAllOutfits: readOutfits,

  addOutfit(outfit: Outfit) {
    const items = readOutfits()
    items.push(outfit)
    writeOutfits(items)
    return outfit
  },

  deleteOutfit(id: string) {
    const items = readOutfits().filter(o => o.id !== id)
    writeOutfits(items)
  },

  getOutfitsByDate(date: string): Outfit[] {
    return readOutfits().filter(o => o.date === date)
  },

  getOutfitsInRange(startDate: string, endDate: string): Outfit[] {
    return readOutfits().filter(o => o.date >= startDate && o.date <= endDate)
  },

  incrementWearCount(clothingIds: string[]) {
    const items = readClothes()
    clothingIds.forEach(id => {
      const item = items.find(c => c.id === id)
      if (item) {
        item.wearCount++
        if (item.wearCount === 1 && item.washStatus === 'clean') {
          item.washStatus = 'worn_once'
        } else if (item.wearCount === 2) {
          item.washStatus = 'worn_twice'
        } else if (item.wearCount >= 3) {
          item.washStatus = 'needs_wash'
        }
      }
    })
    writeClothes(items)
  },

  markAsClean(id: string) {
    const items = readClothes()
    const item = items.find(c => c.id === id)
    if (item) {
      item.washStatus = 'clean'
      item.wearCount = 0
      writeClothes(items)
    }
  },

  getLaundryItems(): ClothingItem[] {
    return readClothes().filter(c => c.washStatus === 'needs_wash' || c.washStatus === 'washing')
  },
}
