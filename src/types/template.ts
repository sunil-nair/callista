export type ElementType = 'text' | 'image' | 'shape' | 'button';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  style: {
    fontSize: number;
    fontWeight: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontFamily?: string;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt: string;
  style: {
    objectFit: 'contain' | 'cover' | 'fill';
    objectPosition?: string;
    borderRadius: number;
  };
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle';
  style: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
  };
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  text: string;
  href: string;
  style: {
    backgroundColor: string;
    color: string;
    fontSize: number;
    borderRadius: number;
    paddingX: number;
    paddingY: number;
  };
}

export type TemplateElement = TextElement | ImageElement | ShapeElement | ButtonElement;

export interface EmailTemplate {
  elements: TemplateElement[];
  canvasSize: {
    width: number;
    height: number;
  };
}
