import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})
export class BlogCard {
  readonly model = input.required<Blog>();
  readonly liked = output<number>();

  protected onLikeClick(): void {
    this.liked.emit(this.model().id);
  }
}
