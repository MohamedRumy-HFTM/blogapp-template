import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blog } from '../blog.model';
import { BlogCard } from './blog-card';

describe('BlogCard', () => {
  let component: BlogCard;
  let fixture: ComponentFixture<BlogCard>;

  const testBlog: Blog = {
    id: 1,
    title: 'Test Blog',
    contentPreview: 'Das ist ein Test Blog.',
    author: 'Test Autor',
    likes: 0,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCard);
    fixture.componentRef.setInput('model', testBlog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
