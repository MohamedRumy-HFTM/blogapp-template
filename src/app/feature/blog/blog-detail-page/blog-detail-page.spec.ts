import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Blog } from '../blog.model';
import { BlogDetailPage } from './blog-detail-page';

describe('BlogDetailPage', () => {
  let component: BlogDetailPage;
  let fixture: ComponentFixture<BlogDetailPage>;

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
      imports: [BlogDetailPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetailPage);
    fixture.componentRef.setInput('blog', testBlog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
