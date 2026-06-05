import { EmailComponent } from '@/types/email';

export function buildInlineStyle(props: Record<string, any>): string {
  const styles: string[] = [];
  const entries = Object.entries(props);

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    let cssValue = String(value);
    if (
      (key === 'fontSize' || key === 'lineHeight' || key === 'borderRadius') &&
      !cssValue.includes('px') &&
      !cssValue.includes('em') &&
      !cssValue.includes('%') &&
      cssValue !== '0'
    ) {
      cssValue = cssValue + 'px';
    }
    styles.push(`${cssKey}: ${cssValue}`);
  }

  return styles.join('; ');
}

export function getComponentDefaultProps(type: EmailComponent['type']): Record<string, any> {
  switch (type) {
    case 'heading':
      return {
        text: '标题文字',
        fontSize: 28,
        fontFamily: 'Arial, sans-serif',
        color: '#1a1a1a',
        align: 'center',
        lineHeight: 1.4,
        padding: '10px 20px',
        margin: '0',
        fontWeight: 'bold',
      };
    case 'paragraph':
      return {
        text: '这是一段正文文字，您可以在属性面板中修改内容和样式。',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#333333',
        align: 'left',
        lineHeight: 1.6,
        padding: '10px 20px',
        margin: '0',
        fontWeight: 'normal',
      };
    case 'button':
      return {
        text: '点击按钮',
        url: 'https://example.com',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        align: 'center',
        padding: '12px 32px',
        margin: '10px 20px',
        borderRadius: 6,
        fontWeight: 'bold',
      };
    case 'image':
      return {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20email%20banner%20abstract%20gradient%20blue%20clean&image_size=landscape_16_9',
        alt: '邮件图片',
        width: '100%',
        align: 'center',
        padding: '10px 20px',
        margin: '0',
        borderRadius: 0,
        link: '',
      };
    case 'divider':
      return {
        color: '#e5e7eb',
        thickness: 1,
        style: 'solid',
        padding: '10px 20px',
        margin: '0',
        width: '100%',
      };
    case 'spacer':
      return {
        height: 20,
        padding: '0',
        margin: '0',
      };
    case 'two-column':
      return {
        columnRatio: '50,50',
        padding: '10px 20px',
        gap: 10,
      };
    case 'three-column':
      return {
        columnRatio: '33,34,33',
        padding: '10px 20px',
        gap: 10,
      };
    case 'social-icons':
      return {
        platforms: [
          { key: 'facebook', label: 'Facebook', icon: '📘', url: 'https://facebook.com' },
          { key: 'twitter', label: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
          { key: 'instagram', label: 'Instagram', icon: '📷', url: 'https://instagram.com' },
        ],
        iconSize: 32,
        align: 'center',
        padding: '10px 20px',
        margin: '0',
      };
    case 'footer':
      return {
        text: '© 2026 您的公司名称\n地址：XX省XX市XX区XX路XX号\n退订邮件 | 联系我们',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        color: '#999999',
        align: 'center',
        lineHeight: 1.6,
        padding: '20px',
        margin: '0',
        fontWeight: 'normal',
      };
    default:
      return {};
  }
}

export function renderComponentToHtml(
  component: EmailComponent,
  variables: Record<string, string>,
  showVariables: boolean
): string {
  const p = { ...component.properties };
  const processText = (text: string): string => {
    if (showVariables) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  };

  switch (component.type) {
    case 'heading':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td style="${buildInlineStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: p.color, textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight })}">${processText(p.text || '')}</td></tr></table>`;

    case 'paragraph':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td style="${buildInlineStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: p.color, textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight })}">${processText(p.text || '').replace(/\n/g, '<br>')}</td></tr></table>`;

    case 'button': {
      const btnStyle = buildInlineStyle({
        fontSize: p.fontSize,
        fontFamily: p.fontFamily,
        color: p.color,
        backgroundColor: p.backgroundColor,
        padding: p.padding,
        borderRadius: p.borderRadius,
        fontWeight: p.fontWeight,
        textDecoration: 'none',
        display: 'inline-block',
      });
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: '0', margin: p.margin })}"><tr><td align="${p.align || 'center'}" style="${buildInlineStyle({ padding: p.padding })}"><a href="${p.url || '#'}" style="${btnStyle}" target="_blank">${processText(p.text || '')}</a></td></tr></table>`;
    }

    case 'image': {
      const imgTag = `<img src="${p.src}" alt="${p.alt || ''}" width="${p.width || '100%'}" style="${buildInlineStyle({ maxWidth: '100%', height: 'auto', borderRadius: p.borderRadius, display: 'block' })}" />`;
      const content = p.link ? `<a href="${p.link}" target="_blank">${imgTag}</a>` : imgTag;
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td align="${p.align || 'center'}">${content}</td></tr></table>`;
    }

    case 'divider':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td style="${buildInlineStyle({ fontSize: '0', lineHeight: '0' })}" align="${p.align || 'center'}"><hr style="${buildInlineStyle({ border: 'none', borderTop: `${p.thickness || 1}px ${p.style || 'solid'} ${p.color || '#e5e7eb'}`, width: p.width, margin: '0' })}" /></td></tr></table>`;

    case 'spacer':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td style="${buildInlineStyle({ fontSize: '0', lineHeight: '0', height: p.height })}">&nbsp;</td></tr></table>`;

    case 'two-column': {
      const ratios = (p.columnRatio || '50,50').split(',').map(Number);
      const total = ratios.reduce((a: number, b: number) => a + b, 0);
      const col1Pct = Math.round((ratios[0] / total) * 100);
      const col2Pct = 100 - col1Pct;
      const children = component.children || [[], []];
      const col1Html = children[0].map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');
      const col2Html = children[1].map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td width="${col1Pct}%" valign="top" style="${buildInlineStyle({ padding: `0 ${Math.floor((p.gap || 0) / 2)}px 0 0` })}">${col1Html || '&nbsp;'}</td><td width="${col2Pct}%" valign="top" style="${buildInlineStyle({ padding: `0 0 0 ${Math.ceil((p.gap || 0) / 2)}px` })}">${col2Html || '&nbsp;'}</td></tr></table>`;
    }

    case 'three-column': {
      const ratios = (p.columnRatio || '33,34,33').split(',').map(Number);
      const total = ratios.reduce((a: number, b: number) => a + b, 0);
      const col1Pct = Math.round((ratios[0] / total) * 100);
      const col2Pct = Math.round((ratios[1] / total) * 100);
      const col3Pct = 100 - col1Pct - col2Pct;
      const children = component.children || [[], [], []];
      const halfGap = Math.floor((p.gap || 0) / 2);
      const col1Html = children[0].map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');
      const col2Html = children[1].map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');
      const col3Html = children[2].map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td width="${col1Pct}%" valign="top" style="${buildInlineStyle({ padding: `0 ${halfGap}px 0 0` })}">${col1Html || '&nbsp;'}</td><td width="${col2Pct}%" valign="top" style="${buildInlineStyle({ padding: `0 ${halfGap}px` })}">${col2Html || '&nbsp;'}</td><td width="${col3Pct}%" valign="top" style="${buildInlineStyle({ padding: `0 0 0 ${halfGap}px` })}">${col3Html || '&nbsp;'}</td></tr></table>`;
    }

    case 'social-icons': {
      const platforms = p.platforms || [];
      const iconCells = platforms.map((pl: any) => `<td align="center" valign="middle" style="${buildInlineStyle({ padding: '0 8px' })}"><a href="${pl.url || '#'}" target="_blank" style="${buildInlineStyle({ textDecoration: 'none', fontSize: p.iconSize || 32, lineHeight: '1' })}">${pl.icon}</a></td>`).join('\n');
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td align="${p.align || 'center'}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${iconCells}</tr></table></td></tr></table>`;
    }

    case 'footer':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${buildInlineStyle({ padding: p.padding, margin: p.margin })}"><tr><td style="${buildInlineStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: p.color, textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight })}">${processText(p.text || '').replace(/\n/g, '<br>')}</td></tr></table>`;

    default:
      return '';
  }
}

export function generateFullHtml(
  components: EmailComponent[],
  backgroundColor: string,
  variables: Record<string, string>,
  showVariables: boolean
): string {
  const bodyContent = components.map(c => renderComponentToHtml(c, variables, showVariables)).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>邮件模板</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; margin: 0 auto;">
${bodyContent.split('\n').map((line: string) => '          ' + line).join('\n')}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
