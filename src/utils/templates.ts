import { ElementType } from '@/types'
import type { CanvasElement } from '@/types'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  createElementFn: (pageId: string) => CanvasElement[]
}

function el(
  pageId: string,
  type: ElementType,
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: crypto.randomUUID(),
    pageId,
    parentId: null,
    type,
    x,
    y,
    width,
    height,
    rotation: 0,
    fill: '#ffffff',
    stroke: '#e0e0e0',
    strokeWidth: 1,
    cornerRadius: 0,
    shadow: '',
    text: '',
    locked: false,
    visible: true,
    zIndex: 0,
    groupId: null,
    styleProps: {},
    opacity: 1,
    ...overrides,
  }
}

function mobileAppFramework(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z

  return [
    el(pageId, ElementType.STATUS_BAR, 0, 0, W, 44, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: '9:41',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.NAV_BAR, 0, 44, W, 44, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'App Title',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 16, 104, W - 32, 160, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Featured Card',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16, 280, W - 32, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'List Item 1',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16, 344, W - 32, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'List Item 2',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16, 408, W - 32, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'List Item 3',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BOTTOM_BAR, 0, 720, W, 50, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      zIndex: nextZ(),
    }),
  ]
}

function adminDashboard(pageId: string): CanvasElement[] {
  const W = 1200
  let z = 0
  const nextZ = () => ++z

  return [
    el(pageId, ElementType.TOP_BAR, 0, 0, W, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Dashboard',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 24, 80, 370, 160, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Card 1',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 414, 80, 370, 160, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Card 2',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 804, 80, 370, 160, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Card 3',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TABLE, 24, 264, 700, 320, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Data Table',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CHART_PLACEHOLDER, 744, 264, 432, 320, {
      fill: '#f0f0f0',
      stroke: '#cccccc',
      text: 'Chart',
      zIndex: nextZ(),
    }),
  ]
}

function loginPage(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z
  const cardX = 28
  const cardW = W - 56
  const cardH = 420
  const innerX = cardX + 24
  const innerW = cardW - 48

  return [
    el(pageId, ElementType.CARD, cardX, 80, cardW, cardH, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 12,
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.AVATAR, cardX + cardW / 2 - 32, 110, 64, 64, {
      fill: '#e0e0e0',
      stroke: 'none',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, innerX, 190, innerW, 28, {
      fill: 'none',
      stroke: 'none',
      text: 'Welcome Back',
      styleProps: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, innerX, 234, innerW, 40, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 6,
      text: 'Email',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, innerX, 286, innerW, 40, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 6,
      text: 'Password',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, innerX, 346, innerW, 44, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 6,
      text: 'Log In',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, innerX, 404, innerW, 20, {
      fill: 'none',
      stroke: 'none',
      text: 'Forgot password?',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#4A90D9' },
      zIndex: nextZ(),
    }),
  ]
}

function settingsPage(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z
  const px = 20
  const cw = W - 40

  return [
    el(pageId, ElementType.TOP_BAR, 0, 0, W, 44, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Settings',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.FORM_LABEL, px, 64, cw, 20, {
      fill: 'none',
      stroke: 'none',
      text: 'Display Name',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, px, 88, cw, 36, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 4,
      text: 'John Doe',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.FORM_LABEL, px, 140, cw, 20, {
      fill: 'none',
      stroke: 'none',
      text: 'Email',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, px, 164, cw, 36, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 4,
      text: 'john@example.com',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.FORM_LABEL, px, 216, cw, 20, {
      fill: 'none',
      stroke: 'none',
      text: 'Notifications',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.SWITCH, px, 244, 44, 24, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 12,
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.FORM_LABEL, px, 284, cw, 20, {
      fill: 'none',
      stroke: 'none',
      text: 'Dark Mode',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.SWITCH, px, 312, 44, 24, {
      fill: '#cccccc',
      stroke: 'none',
      cornerRadius: 12,
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, px, 680, cw, 44, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 6,
      text: 'Save Changes',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
  ]
}

function ecommerceProduct(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z
  const px = 16
  const cw = W - 32

  return [
    el(pageId, ElementType.IMAGE_PLACEHOLDER, 0, 0, W, 280, {
      fill: '#f0f0f0',
      stroke: '#cccccc',
      text: 'Product Image',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, px, 296, cw, 28, {
      fill: 'none',
      stroke: 'none',
      text: 'Product Name',
      styleProps: { fontSize: 20, fontWeight: 'bold' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.RATING, px, 332, 120, 24, {
      fill: 'none',
      stroke: 'none',
      text: '★★★★☆',
      styleProps: { fontSize: 16 },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, px, 364, cw, 24, {
      fill: 'none',
      stroke: 'none',
      text: '$49.99',
      styleProps: { fontSize: 18, fontWeight: 'bold', textColor: '#4A90D9' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, px, 404, cw, 44, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 6,
      text: 'Add to Cart',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, px, 468, cw, 52, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Spec: Lightweight design',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, px, 524, cw, 52, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Spec: Premium materials',
      zIndex: nextZ(),
    }),
  ]
}

function chatInterface(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z

  return [
    el(pageId, ElementType.NAV_BAR, 0, 0, W, 44, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Chat',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 0, 44, W, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Hey, how are you?',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 0, 108, W, 64, {
      fill: '#f5f5f5',
      stroke: '#e0e0e0',
      text: "I'm good! What about you?",
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 0, 172, W, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Doing great! Any plans?',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 0, 236, W, 64, {
      fill: '#f5f5f5',
      stroke: '#e0e0e0',
      text: 'Maybe we can meet up?',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 0, 300, W, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: "That sounds great!",
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, 16, 714, W - 88, 40, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 20,
      text: 'Type a message...',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, W - 64, 714, 48, 40, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 20,
      text: 'Send',
      styleProps: { textColor: '#ffffff', fontSize: 12 },
      zIndex: nextZ(),
    }),
  ]
}

function profilePage(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z
  const cx = W / 2

  return [
    el(pageId, ElementType.AVATAR, cx - 44, 40, 88, 88, {
      fill: '#e0e0e0',
      stroke: '#cccccc',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, 16, 148, W - 32, 28, {
      fill: 'none',
      stroke: 'none',
      text: 'Jane Smith',
      styleProps: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, 32, 184, W - 64, 40, {
      fill: 'none',
      stroke: 'none',
      text: 'Product designer crafting delightful experiences.',
      styleProps: { fontSize: 14, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16, 244, (W - 48) / 4, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Posts\n128',
      styleProps: { fontSize: 11, textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16 + (W - 48) / 4 + 8, 244, (W - 48) / 4, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Followers\n2.4k',
      styleProps: { fontSize: 11, textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16 + ((W - 48) / 4 + 8) * 2, 244, (W - 48) / 4, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Following\n350',
      styleProps: { fontSize: 11, textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LIST_ITEM, 16 + ((W - 48) / 4 + 8) * 3, 244, (W - 48) / 4, 64, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Likes\n5.1k',
      styleProps: { fontSize: 11, textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, 48, 340, W - 96, 40, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 6,
      text: 'Edit Profile',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
  ]
}

function dataTablePage(pageId: string): CanvasElement[] {
  const W = 1200
  let z = 0
  const nextZ = () => ++z
  const px = 24

  return [
    el(pageId, ElementType.TOP_BAR, 0, 0, W, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Data Table',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.INPUT, px, 76, 280, 36, {
      fill: '#ffffff',
      stroke: '#cccccc',
      cornerRadius: 4,
      text: 'Search...',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, W - px - 120, 76, 120, 36, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 4,
      text: 'Add New',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TABLE, px, 128, W - 48, 400, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Data Table',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.LINE, W / 2 - 80, 548, 160, 1, {
      fill: '#4A90D9',
      stroke: '#4A90D9',
      strokeWidth: 2,
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, W / 2 - 80, 556, 32, 20, {
      fill: 'none',
      stroke: 'none',
      text: '1',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#4A90D9', fontWeight: 'bold' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, W / 2 - 48, 556, 32, 20, {
      fill: 'none',
      stroke: 'none',
      text: '2',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, W / 2 - 16, 556, 32, 20, {
      fill: 'none',
      stroke: 'none',
      text: '3',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, W / 2 + 16, 556, 32, 20, {
      fill: 'none',
      stroke: 'none',
      text: '4',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, W / 2 + 48, 556, 32, 20, {
      fill: 'none',
      stroke: 'none',
      text: '5',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
  ]
}

function formPage(pageId: string): CanvasElement[] {
  const W = 375
  let z = 0
  const nextZ = () => ++z
  const px = 20
  const cw = W - 40
  let y = 20

  return [
    el(pageId, ElementType.TEXT, px, y, cw, 28, {
      fill: 'none',
      stroke: 'none',
      text: 'Registration Form',
      styleProps: { fontSize: 22, fontWeight: 'bold' },
      zIndex: nextZ(),
    }),
    ...(() => {
      const items: CanvasElement[] = []
      y += 48
      const fields = ['Full Name', 'Email Address', 'Phone Number', 'Username', 'Password']
      for (const label of fields) {
        items.push(
          el(pageId, ElementType.FORM_LABEL, px, y, cw, 20, {
            fill: 'none',
            stroke: 'none',
            text: label,
            zIndex: nextZ(),
          }),
        )
        y += 24
        items.push(
          el(pageId, ElementType.INPUT, px, y, cw, 36, {
            fill: '#ffffff',
            stroke: '#cccccc',
            cornerRadius: 4,
            text: label,
            zIndex: nextZ(),
          }),
        )
        y += 52
      }
      items.push(
        el(pageId, ElementType.FORM_LABEL, px, y, cw, 20, {
          fill: 'none',
          stroke: 'none',
          text: 'Country',
          zIndex: nextZ(),
        }),
      )
      y += 24
      items.push(
        el(pageId, ElementType.DROPDOWN, px, y, cw, 36, {
          fill: '#ffffff',
          stroke: '#cccccc',
          cornerRadius: 4,
          text: 'Select Country',
          zIndex: nextZ(),
        }),
      )
      y += 52
      items.push(
        el(pageId, ElementType.FORM_LABEL, px, y, cw, 20, {
          fill: 'none',
          stroke: 'none',
          text: 'I agree to the terms',
          zIndex: nextZ(),
        }),
      )
      y += 24
      items.push(
        el(pageId, ElementType.CHECKBOX, px, y, 20, 20, {
          fill: '#ffffff',
          stroke: '#cccccc',
          zIndex: nextZ(),
        }),
      )
      y += 48
      items.push(
        el(pageId, ElementType.BUTTON, px, y, (cw - 12) / 2, 40, {
          fill: '#4A90D9',
          stroke: 'none',
          cornerRadius: 6,
          text: 'Submit',
          styleProps: { textColor: '#ffffff' },
          zIndex: nextZ(),
        }),
      )
      items.push(
        el(pageId, ElementType.BUTTON, px + (cw - 12) / 2 + 12, y, (cw - 12) / 2, 40, {
          fill: '#ffffff',
          stroke: '#cccccc',
          cornerRadius: 6,
          text: 'Cancel',
          styleProps: { textColor: '#666666' },
          zIndex: nextZ(),
        }),
      )
      return items
    })(),
  ]
}

function landingPage(pageId: string): CanvasElement[] {
  const W = 1200
  let z = 0
  const nextZ = () => ++z
  const cx = W / 2

  return [
    el(pageId, ElementType.NAV_BAR, 0, 0, W, 56, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      text: 'Brand',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, cx - 300, 120, 600, 56, {
      fill: 'none',
      stroke: 'none',
      text: 'Build Better Products Faster',
      styleProps: { fontSize: 42, fontWeight: 'bold', textAlign: 'center' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, cx - 280, 192, 560, 40, {
      fill: 'none',
      stroke: 'none',
      text: 'The all-in-one platform for teams who ship great software.',
      styleProps: { fontSize: 18, textAlign: 'center', textColor: '#666666' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.BUTTON, cx - 80, 256, 160, 48, {
      fill: '#4A90D9',
      stroke: 'none',
      cornerRadius: 6,
      text: 'Get Started',
      styleProps: { textColor: '#ffffff' },
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.IMAGE_PLACEHOLDER, cx - 320, 336, 640, 320, {
      fill: '#f0f0f0',
      stroke: '#cccccc',
      text: 'Hero Image',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 48, 704, 360, 200, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Feature 1',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 420, 704, 360, 200, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Feature 2',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.CARD, 792, 704, 360, 200, {
      fill: '#ffffff',
      stroke: '#e0e0e0',
      cornerRadius: 8,
      text: 'Feature 3',
      zIndex: nextZ(),
    }),
    el(pageId, ElementType.TEXT, 0, 940, W, 24, {
      fill: 'none',
      stroke: 'none',
      text: '© 2026 Brand Inc. All rights reserved.',
      styleProps: { fontSize: 13, textAlign: 'center', textColor: '#999999' },
      zIndex: nextZ(),
    }),
  ]
}

export function getTemplates(): Template[] {
  return [
    {
      id: 'mobile-app-framework',
      name: 'Mobile App Framework',
      description: 'Basic mobile app structure with status bar, navigation, and content',
      icon: '📱',
      createElementFn: mobileAppFramework,
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      description: 'Desktop dashboard with stats cards, table, and chart',
      icon: '📊',
      createElementFn: adminDashboard,
    },
    {
      id: 'login-page',
      name: 'Login Page',
      description: 'Centered login form with avatar and inputs',
      icon: '🔐',
      createElementFn: loginPage,
    },
    {
      id: 'settings-page',
      name: 'Settings Page',
      description: 'Settings form with inputs and toggles',
      icon: '⚙️',
      createElementFn: settingsPage,
    },
    {
      id: 'ecommerce-product',
      name: 'E-commerce Product',
      description: 'Product detail page with image, rating, and specs',
      icon: '🛒',
      createElementFn: ecommerceProduct,
    },
    {
      id: 'chat-interface',
      name: 'Chat Interface',
      description: 'Messaging app with message list and input bar',
      icon: '💬',
      createElementFn: chatInterface,
    },
    {
      id: 'profile-page',
      name: 'Profile Page',
      description: 'User profile with avatar, stats, and edit button',
      icon: '👤',
      createElementFn: profilePage,
    },
    {
      id: 'data-table-page',
      name: 'Data Table Page',
      description: 'Desktop data table with search and pagination',
      icon: '📋',
      createElementFn: dataTablePage,
    },
    {
      id: 'form-page',
      name: 'Form Page',
      description: 'Registration form with various input types',
      icon: '📝',
      createElementFn: formPage,
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Marketing landing page with hero and feature cards',
      icon: '🚀',
      createElementFn: landingPage,
    },
  ]
}
