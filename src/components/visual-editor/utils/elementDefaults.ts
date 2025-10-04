import { TextElement, ImageElement, ShapeElement, ButtonElement } from "@/types/template";
import { v4 as uuidv4 } from 'uuid';

export const createDefaultTextElement = (position: { x: number; y: number }, zIndex: number): TextElement => ({
  id: uuidv4(),
  type: 'text',
  position,
  size: { width: 200, height: 50 },
  zIndex,
  content: 'Enter text here',
  style: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'left',
    fontFamily: 'Inter, sans-serif',
  },
});

export const createDefaultImageElement = (position: { x: number; y: number }, zIndex: number): ImageElement => ({
  id: uuidv4(),
  type: 'image',
  position,
  size: { width: 200, height: 100 },
  zIndex,
  src: 'https://via.placeholder.com/200x100',
  alt: 'Image',
  style: {
    objectFit: 'contain',
    borderRadius: 0,
  },
});

export const createDefaultShapeElement = (position: { x: number; y: number }, zIndex: number): ShapeElement => ({
  id: uuidv4(),
  type: 'shape',
  position,
  size: { width: 200, height: 200 },
  zIndex,
  shapeType: 'rectangle',
  style: {
    backgroundColor: '#cccccc',
    borderColor: '#000000',
    borderWidth: 0,
    borderRadius: 0,
  },
});

export const createDefaultButtonElement = (position: { x: number; y: number }, zIndex: number): ButtonElement => ({
  id: uuidv4(),
  type: 'button',
  position,
  size: { width: 150, height: 40 },
  zIndex,
  text: 'Click me',
  href: 'https://example.com',
  style: {
    backgroundColor: '#0066cc',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 4,
    paddingX: 20,
    paddingY: 10,
  },
});

export const normalizeAIElement = (element: any) => {
  if (element.type === 'text') {
    return {
      ...element,
      style: {
        ...element.style,
        color: element.style.color || '#000000',
        fontSize: element.style.fontSize || 16,
        fontWeight: element.style.fontWeight || '400',
        textAlign: element.style.textAlign || 'left',
        fontFamily: element.style.fontFamily || 'Inter, sans-serif',
      },
    };
  } else if (element.type === 'shape') {
    return {
      ...element,
      style: {
        ...element.style,
        backgroundColor: element.style.backgroundColor || '#e0e0e0',
        borderColor: element.style.borderColor || '#000000',
        borderWidth: element.style.borderWidth ?? 0,
        borderRadius: element.style.borderRadius ?? 0,
      },
    };
  } else if (element.type === 'button') {
    return {
      ...element,
      style: {
        ...element.style,
        backgroundColor: element.style.backgroundColor || '#0066cc',
        color: element.style.color || '#ffffff',
        fontSize: element.style.fontSize || 16,
        borderRadius: element.style.borderRadius ?? 4,
        paddingX: element.style.paddingX ?? 20,
        paddingY: element.style.paddingY ?? 10,
      },
    };
  } else if (element.type === 'image') {
    return {
      ...element,
      style: {
        ...element.style,
        objectFit: element.style.objectFit || 'contain',
        objectPosition: element.style.objectPosition || 'center',
        borderRadius: element.style.borderRadius ?? 0,
      },
    };
  }
  return element;
};
