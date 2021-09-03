export default function template(html: string): HTMLElement {
  const templateWrapper = document.createElement('template');
  templateWrapper.innerHTML = html;
  return templateWrapper.content.firstChild as HTMLElement;
}
