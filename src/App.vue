<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎨 艺术二维码生成器</h1>
      <p>创建独特、美观且可扫描的艺术二维码</p>
    </header>

    <div class="main-content">
      <div class="preview-panel">
        <h2 style="margin-bottom: 10px; color: #333;">预览</h2>
        <div class="qrcode-wrapper">
          <canvas
            ref="qrCanvas"
            class="qrcode-canvas"
            :width="canvasSize"
            :height="canvasSize"
          ></canvas>
        </div>

        <div class="scan-status" :class="scanResult.status">
          <span class="scan-status-icon">{{ scanResult.icon }}</span>
          <span>{{ scanResult.message }}</span>
        </div>

        <div class="btn-group" style="margin-top: 20px;">
          <button class="btn btn-success" @click="exportPNG">
            <span>📥</span> 导出 PNG
          </button>
          <button class="btn btn-warning" @click="exportSVG">
            <span>📐</span> 导出 SVG
          </button>
        </div>
      </div>

      <div class="controls-panel">
        <div class="control-section">
          <h3 class="section-title">
            <span>📝</span> 二维码内容
          </h3>
          <div class="form-group">
            <label class="form-label">输入内容</label>
            <textarea
              v-model="qrContent"
              class="form-textarea"
              placeholder="输入网址、文本或任何内容..."
              @input="generateQR"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">纠错等级</label>
            <select v-model="errorLevel" class="form-input" @change="generateQR">
              <option value="L">低 (7%)</option>
              <option value="M">中 (15%)</option>
              <option value="Q">较高 (25%)</option>
              <option value="H">高 (30%)</option>
            </select>
          </div>
        </div>

        <div class="control-section">
          <h3 class="section-title">
            <span>🎨</span> 颜色定制
          </h3>
          <div class="form-group">
            <label class="form-label">前景色</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="foregroundColor"
                class="color-picker"
                @input="generateQR"
              />
              <span class="color-value">{{ foregroundColor }}</span>
            </div>
          </div>
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              id="useGradient"
              v-model="useGradient"
              @change="generateQR"
            />
            <label for="useGradient" class="checkbox-label">启用渐变</label>
          </div>
          <div v-if="useGradient" class="gradient-controls">
            <div class="form-group">
              <label class="form-label">渐变结束色</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  v-model="gradientEndColor"
                  class="color-picker"
                  @input="generateQR"
                />
                <span class="color-value">{{ gradientEndColor }}</span>
              </div>
            </div>
            <div class="form-group gradient-angle">
              <label class="form-label">渐变角度: {{ gradientAngle }}°</label>
              <input
                type="range"
                v-model="gradientAngle"
                min="0"
                max="360"
                class="slider"
                @input="generateQR"
              />
            </div>
          </div>
          <div class="form-group" style="margin-top: 15px;">
            <label class="form-label">背景色</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="backgroundColor"
                class="color-picker"
                @input="generateQR"
              />
              <span class="color-value">{{ backgroundColor }}</span>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3 class="section-title">
            <span>✨</span> 艺术风格
          </h3>
          <div class="template-grid">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-item"
              :class="{ active: selectedTemplate === template.id }"
              @click="selectTemplate(template.id)"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <span>{{ template.name }}</span>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3 class="section-title">
            <span>🖼️</span> 中心 Logo
          </h3>
          <div v-if="!logoImage" class="file-upload" @click="triggerLogoUpload">
            <div class="file-upload-icon">📁</div>
            <div class="file-upload-text">点击上传 Logo 图片</div>
          </div>
          <div v-else class="file-upload-preview">
            <img :src="logoImage" alt="Logo preview" />
            <span class="file-upload-preview-name">{{ logoFileName }}</span>
            <button class="file-upload-remove" @click="removeLogo">×</button>
          </div>
          <input
            type="file"
            ref="logoInput"
            style="display: none"
            accept="image/*"
            @change="handleLogoUpload"
          />
          <div class="form-group" style="margin-top: 15px;">
            <label class="form-label">Logo 大小: {{ logoSize }}%</label>
            <div class="slider-wrapper">
              <input
                type="range"
                v-model="logoSize"
                min="10"
                max="35"
                class="slider"
                @input="generateQR"
              />
              <span class="slider-value">{{ logoSize }}%</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">圆角半径: {{ logoRadius }}%</label>
            <div class="slider-wrapper">
              <input
                type="range"
                v-model="logoRadius"
                min="0"
                max="50"
                class="slider"
                @input="generateQR"
              />
              <span class="slider-value">{{ logoRadius }}%</span>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3 class="section-title">
            <span>🌅</span> 背景图片
          </h3>
          <div v-if="!bgImage" class="file-upload" @click="triggerBgUpload">
            <div class="file-upload-icon">🖼️</div>
            <div class="file-upload-text">点击上传背景图片</div>
          </div>
          <div v-else class="file-upload-preview">
            <img :src="bgImage" alt="Background preview" />
            <span class="file-upload-preview-name">{{ bgFileName }}</span>
            <button class="file-upload-remove" @click="removeBgImage">×</button>
          </div>
          <input
            type="file"
            ref="bgInput"
            style="display: none"
            accept="image/*"
            @change="handleBgUpload"
          />
          <div class="form-group" style="margin-top: 15px;">
            <label class="form-label">二维码透明度: {{ qrOpacity }}%</label>
            <div class="slider-wrapper">
              <input
                type="range"
                v-model="qrOpacity"
                min="30"
                max="100"
                class="slider"
                @input="generateQR"
              />
              <span class="slider-value">{{ qrOpacity }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const qrCanvas = ref(null)
const logoInput = ref(null)
const bgInput = ref(null)

const canvasSize = 400
const qrContent = ref('https://example.com')
const errorLevel = ref('H')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const useGradient = ref(false)
const gradientEndColor = ref('#667eea')
const gradientAngle = ref(135)
const selectedTemplate = ref('dots')
const logoImage = ref(null)
const logoFileName = ref('')
const logoSize = ref(20)
const logoRadius = ref(20)
const bgImage = ref(null)
const bgFileName = ref('')
const qrOpacity = ref(80)

const templates = [
  { id: 'dots', name: '圆点', icon: '●' },
  { id: 'flower', name: '花朵', icon: '🌸' },
  { id: 'star', name: '星星', icon: '⭐' },
  { id: 'heart', name: '心形', icon: '❤️' },
  { id: 'geometric', name: '几何', icon: '◆' }
]

const scanResult = ref({
  status: 'success',
  icon: '✅',
  message: '二维码可正常扫描'
})

const selectTemplate = (id) => {
  selectedTemplate.value = id
  generateQR()
}

const triggerLogoUpload = () => {
  logoInput.value.click()
}

const triggerBgUpload = () => {
  bgInput.value.click()
}

const handleLogoUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    logoFileName.value = file.name
    const reader = new FileReader()
    reader.onload = (event) => {
      logoImage.value = event.target.result
      generateQR()
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  logoImage.value = null
  logoFileName.value = ''
  logoInput.value.value = ''
  generateQR()
}

const handleBgUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    bgFileName.value = file.name
    const reader = new FileReader()
    reader.onload = (event) => {
      bgImage.value = event.target.result
      generateQR()
    }
    reader.readAsDataURL(file)
  }
}

const removeBgImage = () => {
  bgImage.value = null
  bgFileName.value = ''
  bgInput.value.value = ''
  generateQR()
}

const drawFlower = (ctx, x, y, size, color) => {
  const petalCount = 5
  const petalSize = size * 0.45
  ctx.fillStyle = color
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount - Math.PI / 2
    const px = x + Math.cos(angle) * size * 0.3
    const py = y + Math.sin(angle) * size * 0.3
    ctx.beginPath()
    ctx.arc(px, py, petalSize, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = adjustColor(color, 30)
  ctx.fill()
}

const drawStar = (ctx, x, y, size, color) => {
  const spikes = 5
  const outerRadius = size * 0.5
  const innerRadius = size * 0.2
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / spikes - Math.PI / 2
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

const drawHeart = (ctx, x, y, size, color) => {
  ctx.fillStyle = color
  const s = size * 0.45
  ctx.beginPath()
  ctx.moveTo(x, y + s * 0.3)
  ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.1)
  ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s, x, y + s)
  ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.6, x + s, y + s * 0.1)
  ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3)
  ctx.fill()
}

const drawGeometric = (ctx, x, y, size, color) => {
  ctx.fillStyle = color
  const s = size * 0.4
  ctx.beginPath()
  ctx.moveTo(x, y - s)
  ctx.lineTo(x + s, y)
  ctx.lineTo(x, y + s)
  ctx.lineTo(x - s, y)
  ctx.closePath()
  ctx.fill()
}

const adjustColor = (color, amount) => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount)
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

const createGradient = (ctx, size) => {
  const angleRad = (gradientAngle.value * Math.PI) / 180
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2
  const x1 = centerX + Math.cos(angleRad) * radius
  const y1 = centerY + Math.sin(angleRad) * radius
  const x2 = centerX - Math.cos(angleRad) * radius
  const y2 = centerY - Math.sin(angleRad) * radius
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
  gradient.addColorStop(0, foregroundColor.value)
  gradient.addColorStop(1, gradientEndColor.value)
  return gradient
}

const generateQR = async () => {
  const canvas = qrCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const size = canvasSize

  try {
    const qrData = await QRCode.toCanvas(qrContent.value, {
      errorCorrectionLevel: errorLevel.value,
      margin: 0,
      width: size
    })

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = size
    tempCanvas.height = size
    const tempCtx = tempCanvas.getContext('2d')
    await QRCode.toCanvas(tempCanvas, qrContent.value, {
      errorCorrectionLevel: errorLevel.value,
      margin: 0,
      width: size
    })

    const imageData = tempCtx.getImageData(0, 0, size, size)
    const data = imageData.data

    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, size, size)

    if (bgImage.value) {
      const bgImg = new Image()
      bgImg.src = bgImage.value
      await new Promise((resolve) => {
        bgImg.onload = resolve
      })
      const scale = Math.max(size / bgImg.width, size / bgImg.height)
      const w = bgImg.width * scale
      const h = bgImg.height * scale
      const x = (size - w) / 2
      const y = (size - h) / 2
      ctx.globalAlpha = 0.3
      ctx.drawImage(bgImg, x, y, w, h)
      ctx.globalAlpha = 1
    }

    const fillStyle = useGradient.value
      ? createGradient(ctx, size)
      : foregroundColor.value

    const modules = []
    const moduleSize = size / Math.sqrt(data.length / 4)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const isBlack = data[idx] < 128
        if (isBlack) {
          const moduleX = Math.floor(x / moduleSize)
          const moduleY = Math.floor(y / moduleSize)
          if (!modules[moduleY]) modules[moduleY] = []
          modules[moduleY][moduleX] = true
        }
      }
    }

    const moduleCount = modules.length
    const actualModuleSize = size / moduleCount

    if (bgImage.value) {
      ctx.globalAlpha = qrOpacity.value / 100
    }

    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        if (modules[y] && modules[y][x]) {
          const cx = x * actualModuleSize + actualModuleSize / 2
          const cy = y * actualModuleSize + actualModuleSize / 2
          const s = actualModuleSize * 0.9

          const isFinderPattern =
            (x < 7 && y < 7) ||
            (x >= moduleCount - 7 && y < 7) ||
            (x < 7 && y >= moduleCount - 7)

          if (isFinderPattern) {
            ctx.fillStyle = fillStyle
            ctx.fillRect(
              x * actualModuleSize,
              y * actualModuleSize,
              actualModuleSize,
              actualModuleSize
            )
          } else {
            const color = useGradient.value
              ? foregroundColor.value
              : fillStyle

            switch (selectedTemplate.value) {
              case 'dots':
                ctx.fillStyle = fillStyle
                ctx.beginPath()
                ctx.arc(cx, cy, s / 2, 0, Math.PI * 2)
                ctx.fill()
                break
              case 'flower':
                drawFlower(ctx, cx, cy, s, foregroundColor.value)
                break
              case 'star':
                drawStar(ctx, cx, cy, s, foregroundColor.value)
                break
              case 'heart':
                drawHeart(ctx, cx, cy, s, foregroundColor.value)
                break
              case 'geometric':
                drawGeometric(ctx, cx, cy, s, foregroundColor.value)
                break
              default:
                ctx.fillStyle = fillStyle
                ctx.fillRect(
                  x * actualModuleSize + 1,
                  y * actualModuleSize + 1,
                  actualModuleSize - 2,
                  actualModuleSize - 2
                )
            }
          }
        }
      }
    }

    ctx.globalAlpha = 1

    if (logoImage.value) {
      const logoImg = new Image()
      logoImg.src = logoImage.value
      await new Promise((resolve) => {
        logoImg.onload = resolve
      })

      const logoSizePx = (size * logoSize.value) / 100
      const logoX = (size - logoSizePx) / 2
      const logoY = (size - logoSizePx) / 2
      const radius = (logoSizePx * logoRadius.value) / 100

      ctx.fillStyle = backgroundColor.value
      ctx.beginPath()
      const padding = 8
      ctx.roundRect(
        logoX - padding,
        logoY - padding,
        logoSizePx + padding * 2,
        logoSizePx + padding * 2,
        radius + padding
      )
      ctx.fill()

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(logoX, logoY, logoSizePx, logoSizePx, radius)
      ctx.clip()
      ctx.drawImage(logoImg, logoX, logoY, logoSizePx, logoSizePx)
      ctx.restore()
    }

    await nextTick()
    checkScanability()
  } catch (err) {
    console.error('QR generation error:', err)
  }
}

const checkScanability = () => {
  const canvas = qrCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height)

  if (code && code.data === qrContent.value) {
    scanResult.value = {
      status: 'success',
      icon: '✅',
      message: '二维码可正常扫描'
    }
  } else {
    const contrast = calculateContrast()
    if (contrast < 100) {
      scanResult.value = {
        status: 'warning',
        icon: '⚠️',
        message: '对比度较低，建议增大前景与背景颜色差异'
      }
    } else {
      scanResult.value = {
        status: 'error',
        icon: '❌',
        message: '无法识别，请提高纠错等级或简化艺术效果'
      }
    }
  }
}

const calculateContrast = () => {
  const fg = hexToRgb(foregroundColor.value)
  const bg = hexToRgb(backgroundColor.value)
  return Math.abs(fg.r - bg.r) + Math.abs(fg.g - bg.g) + Math.abs(fg.b - bg.b)
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 }
}

const exportPNG = () => {
  const canvas = qrCanvas.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'art-qrcode.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const exportSVG = async () => {
  const size = canvasSize
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
  
  svgContent += `<rect width="${size}" height="${size}" fill="${backgroundColor.value}"/>`
  
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = size
  tempCanvas.height = size
  const tempCtx = tempCanvas.getContext('2d')
  await QRCode.toCanvas(tempCanvas, qrContent.value, {
    errorCorrectionLevel: errorLevel.value,
    margin: 0,
    width: size
  })
  
  const imageData = tempCtx.getImageData(0, 0, size, size)
  const data = imageData.data
  const modules = []
  const moduleSize = size / Math.sqrt(data.length / 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const isBlack = data[idx] < 128
      if (isBlack) {
        const moduleX = Math.floor(x / moduleSize)
        const moduleY = Math.floor(y / moduleSize)
        if (!modules[moduleY]) modules[moduleY] = []
        modules[moduleY][moduleX] = true
      }
    }
  }

  const moduleCount = modules.length
  const actualModuleSize = size / moduleCount
  const fillColor = foregroundColor.value

  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (modules[y] && modules[y][x]) {
        const cx = x * actualModuleSize + actualModuleSize / 2
        const cy = y * actualModuleSize + actualModuleSize / 2
        const s = actualModuleSize * 0.9
        
        const isFinderPattern =
          (x < 7 && y < 7) ||
          (x >= moduleCount - 7 && y < 7) ||
          (x < 7 && y >= moduleCount - 7)

        if (isFinderPattern) {
          svgContent += `<rect x="${x * actualModuleSize}" y="${y * actualModuleSize}" width="${actualModuleSize}" height="${actualModuleSize}" fill="${fillColor}"/>`
        } else if (selectedTemplate.value === 'dots') {
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="${fillColor}"/>`
        } else {
          svgContent += `<rect x="${x * actualModuleSize + 1}" y="${y * actualModuleSize + 1}" width="${actualModuleSize - 2}" height="${actualModuleSize - 2}" fill="${fillColor}"/>`
        }
      }
    }
  }

  if (logoImage.value) {
    const logoSizePx = (size * logoSize.value) / 100
    const logoX = (size - logoSizePx) / 2
    const logoY = (size - logoSizePx) / 2
    svgContent += `<image href="${logoImage.value}" x="${logoX}" y="${logoY}" width="${logoSizePx}" height="${logoSizePx}"/>`
  }

  svgContent += '</svg>'
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const link = document.createElement('a')
  link.download = 'art-qrcode.svg'
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

onMounted(() => {
  generateQR()
})

watch(
  [
    qrContent,
    errorLevel,
    foregroundColor,
    backgroundColor,
    useGradient,
    gradientEndColor,
    gradientAngle,
    selectedTemplate,
    logoSize,
    logoRadius,
    qrOpacity
  ],
  () => {
    generateQR()
  }
)
</script>
