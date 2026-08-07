import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BlogStateService } from '../../../services/blog-state';
import { BlogCard } from '../blog-card/blog-card';

@Component({
  selector: 'app-blog-overview-page',
  imports: [BlogCard, MatProgressSpinnerModule],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPage implements OnInit {
  protected readonly state = inject(BlogStateService);

  ngOnInit(): void {
    void this.state.loadBlogs();
  }
}
