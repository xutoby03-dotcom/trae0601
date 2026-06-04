/// <reference types="vite/client" />

interface Window {
  __thumbnailGenerator?: () => Promise<string | null>;
}
