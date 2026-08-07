import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BlogStateService } from './blog-state';

describe('BlogStateService', () => {
  let service: BlogStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BlogStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
