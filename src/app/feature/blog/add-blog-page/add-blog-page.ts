import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlogCreate } from '../blog-create/blog-create';

@Component({
  selector: 'app-add-blog-page',
  imports: [RouterLink, BlogCreate],
  templateUrl: './add-blog-page.html',
})
export class AddBlogPage {}
