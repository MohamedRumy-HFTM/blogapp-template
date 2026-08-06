import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogService } from '../../../shared/blog';
import { BlogOverviewPage } from './blog-overview-page';

describe('BlogOverviewPage', () => {
  let component: BlogOverviewPage;
  let fixture: ComponentFixture<BlogOverviewPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogOverviewPage],
      providers: [
        provideRouter([]),
        {
          provide: BlogService,
          useValue: {
            getBlogs: () => Promise.resolve([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogOverviewPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
