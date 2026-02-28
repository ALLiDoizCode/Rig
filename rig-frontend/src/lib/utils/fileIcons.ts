/**
 * File icon mapping utility for displaying appropriate Lucide icons based on file extensions
 */

import {
  FileText,
  FileCode,
  FileJson,
  Image,
  Video,
  Music,
  Archive,
  File,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map of file extensions to Lucide React icons
 * Covers 30+ common file types with sensible defaults
 */
const extensionToIconMap: Record<string, LucideIcon> = {
  // Documents
  md: FileText,
  txt: FileText,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  rtf: FileText,

  // Code files
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  py: FileCode,
  java: FileCode,
  c: FileCode,
  cpp: FileCode,
  h: FileCode,
  hpp: FileCode,
  cs: FileCode,
  go: FileCode,
  rs: FileCode,
  rb: FileCode,
  php: FileCode,
  swift: FileCode,
  kt: FileCode,
  scala: FileCode,
  sh: FileCode,
  bash: FileCode,
  zsh: FileCode,
  fish: FileCode,
  html: FileCode,
  css: FileCode,
  scss: FileCode,
  sass: FileCode,
  less: FileCode,
  vue: FileCode,
  svelte: FileCode,
  astro: FileCode,

  // Configuration and data files
  json: FileJson,
  yaml: FileJson,
  yml: FileJson,
  toml: FileJson,
  xml: FileJson,
  csv: FileJson,
  env: FileJson,

  // Images
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  webp: Image,
  ico: Image,
  bmp: Image,
  tiff: Image,
  tif: Image,
  avif: Image,

  // Videos
  mp4: Video,
  mov: Video,
  avi: Video,
  mkv: Video,
  webm: Video,
  flv: Video,
  wmv: Video,
  m4v: Video,

  // Audio
  mp3: Music,
  wav: Music,
  ogg: Music,
  flac: Music,
  aac: Music,
  m4a: Music,
  wma: Music,

  // Archives
  zip: Archive,
  tar: Archive,
  gz: Archive,
  bz2: Archive,
  '7z': Archive,
  rar: Archive,
  xz: Archive,
  tgz: Archive,
};

/**
 * Get the appropriate Lucide icon component for a file extension
 *
 * @param extension - File extension (without the dot)
 * @returns Lucide icon component
 *
 * @example
 * ```tsx
 * const Icon = getFileIcon('ts');
 * return <Icon className="h-4 w-4" />;
 * ```
 */
export function getFileIcon(extension: string | undefined): LucideIcon {
  if (!extension) {
    return File;
  }

  const normalizedExtension = extension.toLowerCase();
  return extensionToIconMap[normalizedExtension] || File;
}

/**
 * Check if an extension is recognized as a code file
 * Useful for syntax highlighting decisions
 */
export function isCodeFile(extension: string | undefined): boolean {
  if (!extension) {
    return false;
  }

  const normalizedExtension = extension.toLowerCase();
  return extensionToIconMap[normalizedExtension] === FileCode;
}

/**
 * Check if an extension is recognized as an image file
 * Useful for preview decisions
 */
export function isImageFile(extension: string | undefined): boolean {
  if (!extension) {
    return false;
  }

  const normalizedExtension = extension.toLowerCase();
  return extensionToIconMap[normalizedExtension] === Image;
}
