import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Blog } from '../blog.model';
import { BlogCard } from './blog-card';

describe('BlogCard', () => {
  let component: BlogCard;
  let fixture: ComponentFixture<BlogCard>;
  let element: HTMLElement;

  const testBlog: Blog = {
    id: 1,
    title: 'Test Blog',
    contentPreview: 'Das ist ein Test Blog.',
    author: 'Test Autor',
    likes: 3,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  async function render(blog: Blog): Promise<void> {
    fixture.componentRef.setInput('model', blog);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    // Shallow: nur die Karte selbst, keine Eltern- oder Geschwister-Komponenten
    await TestBed.configureTestingModule({
      imports: [BlogCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCard);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await render(testBlog);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display blog title, author and preview', () => {
    expect(element.querySelector('mat-card-title')?.textContent).toContain('Test Blog');
    expect(element.querySelector('mat-card-subtitle')?.textContent).toContain('Von Test Autor');
    expect(element.querySelector('mat-card-content')?.textContent).toContain(
      'Das ist ein Test Blog.',
    );
  });

  it('should link the title to the detail page', () => {
    const link = element.querySelector('mat-card-title a');

    expect(link?.getAttribute('href')).toBe('/blog/1');
  });

  it('should emit the blog id when the like button is clicked', () => {
    const liked = vi.fn();
    component.liked.subscribe(liked);

    element.querySelector<HTMLButtonElement>('button')?.click();

    expect(liked).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('should show the liked state', async () => {
    expect(element.querySelector('mat-icon')?.textContent).toContain('favorite_border');

    await render({ ...testBlog, likedByMe: true, likes: 4 });

    expect(element.querySelector('mat-icon')?.textContent?.trim()).toBe('favorite');
    // ">": der Like-Button rendert selbst interne <span>s (Ripple, Fokus)
    expect(element.querySelector('mat-card-actions > span')?.textContent).toBe('4');
  });

  it('should render the header image only when a URL is set', async () => {
    expect(element.querySelector('img')).toBeNull();

    await render({ ...testBlog, headerImageUrl: 'https://images.unsplash.com/test.jpg' });

    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://images.unsplash.com/test.jpg',
    );
  });
});
