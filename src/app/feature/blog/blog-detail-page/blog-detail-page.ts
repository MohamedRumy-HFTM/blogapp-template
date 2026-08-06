import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Blog } from '../blog.model';

@Component({
  selector: 'app-blog-detail-page',
  imports: [RouterLink],
  templateUrl: './blog-detail-page.html',
  styleUrl: './blog-detail-page.scss',
})
export class BlogDetailPage {
  readonly blog = input.required<Blog | undefined>();
}
