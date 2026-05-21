import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image skeleton-base"></div>
    </div>
  `,
  styleUrl: './skeleton-card.css'
})
export class SkeletonCard {}
