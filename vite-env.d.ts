/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FRONT_END_TEST: string;
  readonly VITE_PORT: string;
  readonly VITE_AUTH_LOGIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
