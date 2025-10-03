import { TemplateElement, EmailTemplate } from "@/types/template";

export class HTMLGenerator {
  static generateHTML(template: EmailTemplate, useTableLayout: boolean = false): string {
    const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);
    
    if (useTableLayout) {
      return this.generateTableBasedHTML(template, sortedElements);
    } else {
      return this.generateDivBasedHTML(template, sortedElements);
    }
  }

  private static generateDivBasedHTML(template: EmailTemplate, elements: TemplateElement[]): string {
    const elementsHTML = elements.map((el) => {
      const style = `position: absolute; left: ${el.position.x}px; top: ${el.position.y}px; width: ${el.size.width}px; height: ${el.size.height}px;`;
      
      if (el.type === 'text') {
        const fontFamily = el.style.fontFamily || 'Inter, sans-serif';
        return `<div style="${style} font-size: ${el.style.fontSize}px; font-weight: ${el.style.fontWeight}; color: ${el.style.color}; text-align: ${el.style.textAlign}; font-family: ${fontFamily};">${el.content}</div>`;
      }
      
      if (el.type === 'image') {
        return `<img src="${el.src}" alt="${el.alt}" style="${style} object-fit: ${el.style.objectFit}; border-radius: ${el.style.borderRadius}px;" />`;
      }
      
      if (el.type === 'shape') {
        const shapeStyle = el.shapeType === 'circle' 
          ? `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: 50%;`
          : `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: ${el.style.borderRadius}px;`;
        return `<div style="${shapeStyle}"></div>`;
      }
      
      if (el.type === 'button') {
        return `<a href="${el.href}" style="${style} display: flex; align-items: center; justify-content: center; background-color: ${el.style.backgroundColor}; color: ${el.style.color}; font-size: ${el.style.fontSize}px; border-radius: ${el.style.borderRadius}px; text-decoration: none; padding: ${el.style.paddingY}px ${el.style.paddingX}px;">${el.text}</a>`;
      }
      
      return '';
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
  <div style="position: relative; width: ${template.canvasSize.width}px; height: ${template.canvasSize.height}px; margin: 0 auto; background-color: #ffffff;">
    ${elementsHTML}
  </div>
</body>
</html>`;
  }

  private static generateTableBasedHTML(template: EmailTemplate, elements: TemplateElement[]): string {
    // Use a wrapper table with a single cell containing absolutely positioned elements
    // This maintains the visual layout while using table structure for email compatibility
    
    const elementsHTML = elements.map((el) => {
      const style = `position: absolute; left: ${el.position.x}px; top: ${el.position.y}px; width: ${el.size.width}px; height: ${el.size.height}px;`;
      
      if (el.type === 'text') {
        const fontFamily = el.style.fontFamily || 'Arial, Helvetica, sans-serif';
        return `<div style="${style} font-size: ${el.style.fontSize}px; font-weight: ${el.style.fontWeight}; color: ${el.style.color}; text-align: ${el.style.textAlign}; font-family: ${fontFamily};">${el.content}</div>`;
      }
      
      if (el.type === 'image') {
        return `<img src="${el.src}" alt="${el.alt}" style="${style} object-fit: ${el.style.objectFit}; border-radius: ${el.style.borderRadius}px; max-width: 100%; display: block;" />`;
      }
      
      if (el.type === 'shape') {
        const shapeStyle = el.shapeType === 'circle' 
          ? `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: 50%;`
          : `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: ${el.style.borderRadius}px;`;
        return `<div style="${shapeStyle}"></div>`;
      }
      
      if (el.type === 'button') {
        return `<div style="${style}">
          <a href="${el.href}" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: ${el.style.backgroundColor}; color: ${el.style.color}; font-size: ${el.style.fontSize}px; font-family: Arial, Helvetica, sans-serif; border-radius: ${el.style.borderRadius}px; text-decoration: none; padding: ${el.style.paddingY}px ${el.style.paddingX}px; box-sizing: border-box;">${el.text}</a>
        </div>`;
      }
      
      return '';
    }).join('\n');

    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
    td {border-collapse: collapse;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="${template.canvasSize.width}" cellspacing="0" cellpadding="0" border="0" style="max-width: ${template.canvasSize.width}px; background-color: #ffffff;">
          <tr>
            <td style="position: relative; width: ${template.canvasSize.width}px; height: ${template.canvasSize.height}px; padding: 0;">
              <!--[if mso]>
              <table role="presentation" width="${template.canvasSize.width}" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="width: ${template.canvasSize.width}px; height: ${template.canvasSize.height}px;">
              <![endif]-->
              ${elementsHTML}
              <!--[if mso]>
                  </td>
                </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private static generateTableCell(el: TemplateElement): string {
    const width = el.size.width;
    const height = el.size.height;
    
    if (el.type === 'text') {
      const fontFamily = el.style.fontFamily || 'Arial, sans-serif';
      return `<td width="${width}" height="${height}" style="font-size: ${el.style.fontSize}px; font-weight: ${el.style.fontWeight}; color: ${el.style.color}; text-align: ${el.style.textAlign}; font-family: ${fontFamily}; padding: 10px; vertical-align: top;">${el.content}</td>`;
    }
    
    if (el.type === 'image') {
      return `<td width="${width}" height="${height}" style="padding: 0;">
        <img src="${el.src}" alt="${el.alt}" width="${width}" height="${height}" style="display: block; border-radius: ${el.style.borderRadius}px; max-width: 100%;" />
      </td>`;
    }
    
    if (el.type === 'shape') {
      const borderRadius = el.shapeType === 'circle' ? '50%' : `${el.style.borderRadius}px`;
      return `<td width="${width}" height="${height}" style="background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: ${borderRadius};"></td>`;
    }
    
    if (el.type === 'button') {
      return `<td width="${width}" height="${height}" style="padding: 10px; text-align: center;">
        <a href="${el.href}" style="display: inline-block; background-color: ${el.style.backgroundColor}; color: ${el.style.color}; font-size: ${el.style.fontSize}px; font-family: Arial, sans-serif; text-decoration: none; padding: ${el.style.paddingY}px ${el.style.paddingX}px; border-radius: ${el.style.borderRadius}px;">${el.text}</a>
      </td>`;
    }
    
    return `<td width="${width}" height="${height}"></td>`;
  }
}
