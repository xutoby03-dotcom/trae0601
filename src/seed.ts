import { v4 } from 'uuid'
import { db } from './db'
import { ClothingItem, Outfit } from './types'

function seed() {
  if (db.getAllClothes().length > 0) return

  const clothes: ClothingItem[] = [
    { id: v4(), name: '白色T恤', photo: '', category: 'tops', color: 'white', season: ['spring', 'summer', 'autumn'], thickness: 'thin', occasion: ['casual'], price: 99, washStatus: 'clean', currentWearCount: 0, totalWearCount: 5, createdAt: new Date().toISOString() },
    { id: v4(), name: '黑色衬衫', photo: '', category: 'tops', color: 'black', season: ['all'], thickness: 'thin', occasion: ['work', 'formal'], price: 299, washStatus: 'clean', currentWearCount: 0, totalWearCount: 12, createdAt: new Date().toISOString() },
    { id: v4(), name: '蓝色卫衣', photo: '', category: 'tops', color: 'blue', season: ['spring', 'autumn'], thickness: 'medium', occasion: ['casual', 'sport'], price: 259, washStatus: 'worn_once', currentWearCount: 1, totalWearCount: 8, createdAt: new Date().toISOString() },
    { id: v4(), name: '牛仔外套', photo: '', category: 'outerwear', color: 'denim', season: ['spring', 'autumn'], thickness: 'medium', occasion: ['casual', 'date'], price: 459, washStatus: 'clean', currentWearCount: 0, totalWearCount: 6, createdAt: new Date().toISOString() },
    { id: v4(), name: '黑色风衣', photo: '', category: 'outerwear', color: 'black', season: ['autumn', 'winter'], thickness: 'thick', occasion: ['work', 'formal'], price: 899, washStatus: 'clean', currentWearCount: 0, totalWearCount: 3, createdAt: new Date().toISOString() },
    { id: v4(), name: '牛仔裤', photo: '', category: 'pants', color: 'denim', season: ['all'], thickness: 'medium', occasion: ['casual', 'date'], price: 349, washStatus: 'worn_once', currentWearCount: 1, totalWearCount: 15, createdAt: new Date().toISOString() },
    { id: v4(), name: '黑色西裤', photo: '', category: 'pants', color: 'black', season: ['all'], thickness: 'thin', occasion: ['work', 'formal'], price: 399, washStatus: 'clean', currentWearCount: 0, totalWearCount: 10, createdAt: new Date().toISOString() },
    { id: v4(), name: '卡其休闲裤', photo: '', category: 'pants', color: 'khaki', season: ['spring', 'summer', 'autumn'], thickness: 'thin', occasion: ['casual', 'work'], price: 279, washStatus: 'needs_wash', currentWearCount: 3, totalWearCount: 9, createdAt: new Date().toISOString() },
    { id: v4(), name: '白色运动鞋', photo: '', category: 'shoes', color: 'white', season: ['all'], thickness: 'thin', occasion: ['casual', 'sport'], price: 599, washStatus: 'worn_twice', currentWearCount: 2, totalWearCount: 20, createdAt: new Date().toISOString() },
    { id: v4(), name: '黑色皮鞋', photo: '', category: 'shoes', color: 'black', season: ['all'], thickness: 'medium', occasion: ['work', 'formal'], price: 799, washStatus: 'clean', currentWearCount: 0, totalWearCount: 7, createdAt: new Date().toISOString() },
    { id: v4(), name: '银色手表', photo: '', category: 'accessories', color: 'gray', season: ['all'], thickness: 'thin', occasion: ['work', 'formal', 'date'], price: 1299, washStatus: 'clean', currentWearCount: 0, totalWearCount: 25, createdAt: new Date().toISOString() },
    { id: v4(), name: '红色围巾', photo: '', category: 'accessories', color: 'red', season: ['autumn', 'winter'], thickness: 'medium', occasion: ['casual', 'date'], price: 189, washStatus: 'clean', currentWearCount: 0, totalWearCount: 2, createdAt: new Date().toISOString() },
  ]

  clothes.forEach(c => db.addClothing(c))

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10)

  const outfit1: Outfit = {
    id: v4(),
    name: '休闲日常',
    items: [clothes[0].id, clothes[5].id, clothes[8].id],
    date: twoDaysAgo,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
  const outfit2: Outfit = {
    id: v4(),
    name: '通勤穿搭',
    items: [clothes[1].id, clothes[6].id, clothes[4].id, clothes[9].id, clothes[10].id],
    date: yesterday,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
  const outfit3: Outfit = {
    id: v4(),
    name: '周末出游',
    items: [clothes[2].id, clothes[5].id, clothes[3].id, clothes[8].id],
    date: today,
    createdAt: new Date().toISOString(),
  }

  db.addOutfit(outfit1)
  db.addOutfit(outfit2)
  db.addOutfit(outfit3)
}

seed()
