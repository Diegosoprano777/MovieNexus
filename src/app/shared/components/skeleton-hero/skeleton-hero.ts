import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="skeleton-hero">
      <div class="skeleton-hero-overlay"></div>
      <div class="skeleton-hero-content">
        <div class="skeleton-hero-info">
          <div class="skeleton-badge skeleton-base"></div>
          <div class="skeleton-title skeleton-base"></div>
          <div class="skeleton-overview skeleton-base"></div>
          <div class="skeleton-actions">
            <div class="skeleton-btn skeleton-base"></div>
            <div class="skeleton-btn skeleton-base"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './skeleton-hero.css'
})
export class SkeletonHero {}
