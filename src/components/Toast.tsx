import { motion, AnimatePresence } from 'framer-motion'
import { useCapsuleStore } from '@/store/capsuleStore'

export default function Toast() {
  const toast = useCapsuleStore((s) => s.toast)
  const clearToast = useCapsuleStore((s) => s.clearToast)

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          onClick={clearToast}
          className={`fixed top-6 left-1/2 z-[100] -translate-x-1/2 cursor-pointer rounded-full px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-green-900/80 text-green-200'
              : toast.type === 'error'
              ? 'bg-red-900/80 text-red-200'
              : 'bg-amber-900/80 text-amber-200'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
