import { TemplateElement, TextElement, ImageElement, ShapeElement, ButtonElement } from "@/types/template";
import { v4 as uuidv4 } from 'uuid';

export class HTMLParser {
  private static elementCounter = 0;
  private static yOffset = 20;

  static parseHTML(htmlString: string): TemplateElement[] {
    this.elementCounter = 0;
    this.yOffset = 20;
    
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const elements: TemplateElement[] = [];
    
    // Find all relevant elements
    this.traverseNode(doc.body, elements);
    
    return elements;
  }

  private static traverseNode(node: Node, elements: TemplateElement[], parentX = 20): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // Skip script, style, and meta tags
      if (['script', 'style', 'meta', 'head', 'title'].includes(tagName)) {
        return;
      }

      const computedStyle = this.getComputedStyles(element);
      
      // Check if it's an image
      if (tagName === 'img') {
        const imageElement = this.createImageElement(element, computedStyle, parentX);
        if (imageElement) elements.push(imageElement);
        return;
      }
      
      // Check if it's a button or link that looks like a button
      if (tagName === 'button' || (tagName === 'a' && this.looksLikeButton(element, computedStyle))) {
        const buttonElement = this.createButtonElement(element, computedStyle, parentX);
        if (buttonElement) elements.push(buttonElement);
        return;
      }
      
      // Check if it's a shape (div/span with background color but no/little text)
      if (this.looksLikeShape(element, computedStyle)) {
        const shapeElement = this.createShapeElement(element, computedStyle, parentX);
        if (shapeElement) elements.push(shapeElement);
        return;
      }
      
      // Check if it has text content
      const textContent = this.getDirectTextContent(element);
      if (textContent.trim()) {
        const textElement = this.createTextElement(element, textContent, computedStyle, parentX);
        if (textElement) elements.push(textElement);
      }
      
      // Traverse children
      element.childNodes.forEach(child => {
        this.traverseNode(child, elements, parentX + 10);
      });
    }
  }

  private static getDirectTextContent(element: HTMLElement): string {
    // Get all text content, including from child text nodes
    return element.textContent?.trim() || '';
  }

  private static createTextElement(
    element: HTMLElement,
    content: string,
    styles: CSSStyleDeclaration,
    x: number
  ): TextElement | null {
    if (!content.trim()) return null;

    const fontSize = parseInt(styles.fontSize) || 16;
    const fontWeight = styles.fontWeight || '400';
    const color = this.rgbToHex(styles.color) || '#000000';
    const textAlign = (styles.textAlign as 'left' | 'center' | 'right') || 'left';
    const fontFamily = styles.fontFamily?.split(',')[0].replace(/['"]/g, '') || 'Inter';
    const backgroundColor = this.rgbToHex(styles.backgroundColor);

    // Extract position from inline styles
    const left = parseInt(styles.left) || x;
    const top = parseInt(styles.top) || this.yOffset;
    const width = parseInt(styles.width) || 250;
    const height = parseInt(styles.height) || Math.max(40, Math.ceil(content.length / 30) * 20);

    // Only increment yOffset if no explicit position
    if (!styles.top) {
      this.yOffset += height + 20;
    }

    return {
      id: uuidv4(),
      type: 'text',
      position: { x: left, y: top },
      size: { width, height },
      zIndex: this.elementCounter++,
      content,
      style: {
        fontSize,
        fontWeight: String(fontWeight),
        color,
        textAlign,
        fontFamily: `${fontFamily}, sans-serif`,
        backgroundColor,
      },
    };
  }

  private static createImageElement(
    element: HTMLElement,
    styles: CSSStyleDeclaration,
    x: number
  ): ImageElement | null {
    const img = element as HTMLImageElement;
    if (!img.src) return null;

    // Extract position and size from inline styles
    const left = parseInt(styles.left) || x;
    const top = parseInt(styles.top) || this.yOffset;
    const width = parseInt(styles.width) || 200;
    const height = parseInt(styles.height) || 150;

    // Only increment yOffset if no explicit position
    if (!styles.top) {
      this.yOffset += height + 20;
    }

    const imageElement: ImageElement = {
      id: uuidv4(),
      type: 'image',
      position: { x: left, y: top },
      size: { width, height },
      zIndex: this.elementCounter++,
      src: img.src,
      alt: img.alt || 'Image',
      style: {
        objectFit: 'contain',
        borderRadius: parseInt(styles.borderRadius) || 0,
      },
    };

    return imageElement;
  }

  private static createShapeElement(
    element: HTMLElement,
    styles: CSSStyleDeclaration,
    x: number
  ): ShapeElement | null {
    // Extract position and size from inline styles
    const left = parseInt(styles.left) || x;
    const top = parseInt(styles.top) || this.yOffset;
    const width = parseInt(styles.width) || 200;
    const height = parseInt(styles.height) || 100;
    const backgroundColor = this.rgbToHex(styles.backgroundColor) || '#e5e7eb';
    const borderColor = this.rgbToHex(styles.borderColor) || '#000000';
    const borderWidth = parseInt(styles.borderWidth) || 0;
    const borderRadius = parseInt(styles.borderRadius) || 0;

    // Only increment yOffset if no explicit position
    if (!styles.top) {
      this.yOffset += height + 20;
    }

    const shapeElement: ShapeElement = {
      id: uuidv4(),
      type: 'shape',
      position: { x: left, y: top },
      size: { width, height },
      zIndex: this.elementCounter++,
      shapeType: borderRadius > width / 3 ? 'circle' : 'rectangle',
      style: {
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
      },
    };

    return shapeElement;
  }

  private static createButtonElement(
    element: HTMLElement,
    styles: CSSStyleDeclaration,
    x: number
  ): ButtonElement | null {
    const text = element.textContent?.trim() || 'Button';
    const href = (element as HTMLAnchorElement).href || '#';
    const backgroundColor = this.rgbToHex(styles.backgroundColor) || '#3b82f6';
    const color = this.rgbToHex(styles.color) || '#ffffff';
    const fontSize = parseInt(styles.fontSize) || 16;
    const borderRadius = parseInt(styles.borderRadius) || 8;

    // Extract position from inline styles
    const left = parseInt(styles.left) || x;
    const top = parseInt(styles.top) || this.yOffset;

    // Only increment yOffset if no explicit position
    if (!styles.top) {
      this.yOffset += 60;
    }

    const buttonElement: ButtonElement = {
      id: uuidv4(),
      type: 'button',
      position: { x: left, y: top },
      size: { width: 150, height: 40 },
      zIndex: this.elementCounter++,
      text,
      href,
      style: {
        backgroundColor,
        color,
        fontSize,
        borderRadius,
        paddingX: 24,
        paddingY: 12,
      },
    };

    return buttonElement;
  }

  private static looksLikeButton(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    const hasBackgroundColor = styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const hasPadding = (parseInt(styles.paddingLeft) || 0) > 10;
    const hasBorderRadius = (parseInt(styles.borderRadius) || 0) > 0;
    const text = element.textContent?.trim() || '';
    const isShortText = text.length < 50;
    
    return hasBackgroundColor && (hasPadding || hasBorderRadius) && isShortText;
  }

  private static looksLikeShape(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    const hasBackgroundColor = styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const text = this.getDirectTextContent(element).trim();
    const hasMinimalText = text.length < 10;
    const hasWidth = parseInt(styles.width) > 0;
    const hasHeight = parseInt(styles.height) > 0;
    
    return hasBackgroundColor && hasMinimalText && hasWidth && hasHeight;
  }

  private static getComputedStyles(element: HTMLElement): CSSStyleDeclaration {
    // Parse inline style attribute
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      // Create a temporary element to parse styles
      const tempDiv = document.createElement('div');
      tempDiv.setAttribute('style', styleAttr);
      return tempDiv.style;
    }
    return element.style as CSSStyleDeclaration;
  }

  private static rgbToHex(rgb: string): string | null {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
    
    // Already hex
    if (rgb.startsWith('#')) return rgb;
    
    // Parse rgb/rgba
    const match = rgb.match(/\d+/g);
    if (!match) return null;
    
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}
