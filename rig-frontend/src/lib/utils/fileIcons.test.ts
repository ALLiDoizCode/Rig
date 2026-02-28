import { describe, it, expect } from 'vitest';
import { getFileIcon, isCodeFile, isImageFile } from './fileIcons';
import {
  File,
  FileText,
  FileCode,
  FileJson,
  Image,
  Video,
  Music,
  Archive,
} from 'lucide-react';

describe('getFileIcon', () => {
  it('should return FileCode for TypeScript files', () => {
    expect(getFileIcon('ts')).toBe(FileCode);
    expect(getFileIcon('tsx')).toBe(FileCode);
  });

  it('should return FileCode for JavaScript files', () => {
    expect(getFileIcon('js')).toBe(FileCode);
    expect(getFileIcon('jsx')).toBe(FileCode);
  });

  it('should return FileText for markdown files', () => {
    expect(getFileIcon('md')).toBe(FileText);
  });

  it('should return FileJson for JSON and YAML files', () => {
    expect(getFileIcon('json')).toBe(FileJson);
    expect(getFileIcon('yaml')).toBe(FileJson);
    expect(getFileIcon('yml')).toBe(FileJson);
  });

  it('should return Image for image files', () => {
    expect(getFileIcon('png')).toBe(Image);
    expect(getFileIcon('jpg')).toBe(Image);
    expect(getFileIcon('jpeg')).toBe(Image);
    expect(getFileIcon('svg')).toBe(Image);
  });

  it('should return Video for video files', () => {
    expect(getFileIcon('mp4')).toBe(Video);
    expect(getFileIcon('mov')).toBe(Video);
  });

  it('should return Music for audio files', () => {
    expect(getFileIcon('mp3')).toBe(Music);
    expect(getFileIcon('wav')).toBe(Music);
  });

  it('should return Archive for archive files', () => {
    expect(getFileIcon('zip')).toBe(Archive);
    expect(getFileIcon('tar')).toBe(Archive);
    expect(getFileIcon('gz')).toBe(Archive);
  });

  it('should return File icon for unknown extensions', () => {
    expect(getFileIcon('unknown')).toBe(File);
    expect(getFileIcon('xyz')).toBe(File);
  });

  it('should return File icon for undefined extension', () => {
    expect(getFileIcon(undefined)).toBe(File);
  });

  it('should handle case-insensitive extensions', () => {
    expect(getFileIcon('TS')).toBe(FileCode);
    expect(getFileIcon('PNG')).toBe(Image);
    expect(getFileIcon('Md')).toBe(FileText);
  });
});

describe('isCodeFile', () => {
  it('should return true for code file extensions', () => {
    expect(isCodeFile('ts')).toBe(true);
    expect(isCodeFile('js')).toBe(true);
    expect(isCodeFile('py')).toBe(true);
    expect(isCodeFile('java')).toBe(true);
  });

  it('should return false for non-code file extensions', () => {
    expect(isCodeFile('md')).toBe(false);
    expect(isCodeFile('png')).toBe(false);
    expect(isCodeFile('json')).toBe(false);
  });

  it('should return false for undefined extension', () => {
    expect(isCodeFile(undefined)).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isCodeFile('TS')).toBe(true);
    expect(isCodeFile('JS')).toBe(true);
  });
});

describe('isImageFile', () => {
  it('should return true for image file extensions', () => {
    expect(isImageFile('png')).toBe(true);
    expect(isImageFile('jpg')).toBe(true);
    expect(isImageFile('svg')).toBe(true);
  });

  it('should return false for non-image file extensions', () => {
    expect(isImageFile('ts')).toBe(false);
    expect(isImageFile('md')).toBe(false);
    expect(isImageFile('json')).toBe(false);
  });

  it('should return false for undefined extension', () => {
    expect(isImageFile(undefined)).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isImageFile('PNG')).toBe(true);
    expect(isImageFile('JPG')).toBe(true);
  });
});
