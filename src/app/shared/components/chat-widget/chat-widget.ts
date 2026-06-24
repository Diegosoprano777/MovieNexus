import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GeminiService } from '../../../core/services/gemini.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget {
  protected readonly geminiService = inject(GeminiService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  // Señal local para abrir/cerrar la ventana del chat
  readonly isOpen = signal<boolean>(false);
  // Señal local para enlazar el texto de entrada del usuario
  readonly userInput = signal<string>('');

  constructor() {
    // Scroll automático al final de la ventana cada vez que cambia el historial
    effect(() => {
      this.geminiService.messages();
      this.scrollToBottom();
    });
  }

  /**
   * Alterna la visibilidad de la ventana de chat.
   */
  toggleChat(): void {
    this.isOpen.update(val => !val);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  /**
   * Envía el mensaje escrito por el usuario.
   */
  async handleSend(): Promise<void> {
    const text = this.userInput().trim();
    if (!text || this.geminiService.loading()) return;

    this.userInput.set(''); // Limpiar el input inmediatamente
    await this.geminiService.sendMessage(text);
  }

  /**
   * Limpia el chat.
   */
  handleClear(): void {
    if (confirm('¿Estás seguro de que deseas limpiar el historial de conversación?')) {
      this.geminiService.clearHistory();
    }
  }

  /**
   * Parser de Markdown sumamente liviano y libre de dependencias.
   */
  parseMarkdown(text: string): SafeHtml {
    if (!text) return '';

    // Sanitización básica de etiquetas HTML para evitar inyecciones XSS
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Negrita (**texto** o __texto__)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Cursiva (*texto* o _texto_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Código en línea (`codigo`)
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Enlaces de Markdown ([texto](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');

    // Convertir líneas de lista (empezando con "-" o "*") en <li>
    html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li>${trimmed.substring(2)}</li>`;
      }
      return line;
    }).join('\n');

    // Agrupar elementos <li> consecutivos dentro de listas <ul>
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, match => `<ul class="chat-list">${match}</ul>`);

    // Saltos de línea
    html = html.replace(/\n/g, '<br>');

    // Permitir la inyección del HTML formateado y sanitizado de forma segura
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Helper para desplazar la caja del chat al final.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
}
