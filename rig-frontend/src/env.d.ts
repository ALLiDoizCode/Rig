/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOSTR_RELAYS: string
  readonly VITE_ARWEAVE_GATEWAY: string
  readonly VITE_ENABLE_DEVTOOLS: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
