import { StructuredTemplate } from "@/types/structuredTemplate";

export class StructuredHtmlGenerator {
  static generateHTML(template: StructuredTemplate, testData?: Record<string, string>): string {
    const processPlaceholder = (text: string): string => {
      if (!testData) return text;
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return testData[key] || match;
      });
    };

    const brand = template.brand;
    const hero = template.hero;
    const cta = template.cta;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${processPlaceholder(template.name)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      padding: 30px 40px;
      background-color: #ffffff;
      border-bottom: 2px solid ${brand.primaryColor};
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo {
      max-height: 50px;
      width: auto;
    }
    .business-name {
      font-size: 24px;
      font-weight: bold;
      color: ${brand.primaryColor};
      margin: 0;
    }
    .hero-section {
      position: relative;
    }
    .hero-image {
      width: 100%;
      height: auto;
      display: block;
    }
    .hero-text {
      padding: 40px 40px 20px;
      text-align: center;
    }
    .hero-headline {
      font-size: 32px;
      font-weight: bold;
      color: ${brand.primaryColor};
      margin: 0 0 15px 0;
      line-height: 1.2;
    }
    .hero-subheadline {
      font-size: 18px;
      color: ${brand.secondaryColor};
      margin: 0;
      line-height: 1.5;
    }
    .content-section {
      padding: 20px 40px;
    }
    .content-text {
      font-size: 16px;
      color: #333333;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .cta-section {
      padding: 30px 40px 40px;
      text-align: center;
    }
    .cta-description {
      font-size: 16px;
      color: #333333;
      margin: 0 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background-color: ${cta.buttonColor || brand.primaryColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      transition: opacity 0.3s;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      padding: 30px 40px;
      background-color: #f9f9f9;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer-text {
      font-size: 14px;
      color: #666666;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        ${brand.logoUrl ? `<img src="${processPlaceholder(brand.logoUrl)}" alt="${processPlaceholder(brand.businessName)}" class="logo">` : ''}
        <h1 class="business-name">${processPlaceholder(brand.businessName)}</h1>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      ${hero.imageUrl ? `<img src="${processPlaceholder(hero.imageUrl)}" alt="Hero" class="hero-image">` : ''}
    </div>

    <div class="hero-text">
      <h2 class="hero-headline">${processPlaceholder(hero.headline)}</h2>
      ${hero.subheadline ? `<p class="hero-subheadline">${processPlaceholder(hero.subheadline)}</p>` : ''}
    </div>

    <!-- Content Sections -->
    ${template.textSections.map(section => `
    <div class="content-section">
      <p class="content-text text-${section.alignment || 'left'}">${processPlaceholder(section.content)}</p>
    </div>
    `).join('')}

    <!-- CTA Section -->
    <div class="cta-section">
      ${cta.description ? `<p class="cta-description">${processPlaceholder(cta.description)}</p>` : ''}
      <a href="${processPlaceholder(cta.buttonUrl)}" class="cta-button">${processPlaceholder(cta.buttonText)}</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${processPlaceholder(brand.businessName)}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
