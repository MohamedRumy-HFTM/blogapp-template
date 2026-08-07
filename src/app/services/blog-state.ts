import { computed, effect, inject, Service, signal } from '@angular/core';

import { Blog } from '../feature/blog/blog.model';
import { BlogService } from '../shared/blog';

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  selectedAuthor: string;
}

@Service()
export class BlogStateService {
  private readonly blogService = inject(BlogService);

  // ── State ────────────────────────────────────────────────────
  readonly #state = signal<BlogState>({
    blogs: [],
    loading: false,
    error: null,
    selectedAuthor: localStorage.getItem('selectedAuthor') ?? 'all',
  });

  // ── Derived State ────────────────────────────────────────────
  readonly blogs = computed(() => this.#state().blogs);
  readonly loading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);
  readonly blogCount = computed(() => this.blogs().length);
  readonly selectedAuthor = computed(() => this.#state().selectedAuthor);

  readonly authors = computed(() => [...new Set(this.blogs().map((blog) => blog.author))]);

  readonly filteredBlogs = computed(() => {
    const author = this.selectedAuthor();
    const blogs = this.blogs();
    return author === 'all' ? blogs : blogs.filter((blog) => blog.author === author);
  });

  // ── Effects ──────────────────────────────────────────────────
  constructor() {
    effect(() => {
      localStorage.setItem('selectedAuthor', this.selectedAuthor());
    });
  }

  // ── Actions ──────────────────────────────────────────────────
  async loadBlogs(): Promise<void> {
    this.#loadStarted();

    try {
      const blogs = await this.blogService.getBlogs();
      this.#loadSucceeded(blogs);
    } catch {
      this.#loadFailed('Blogs konnten nicht geladen werden.');
    }
  }

  setAuthor(author: string): void {
    this.#authorSelected(author);
  }

  toggleLike(blogId: number): void {
    this.#likeToggled(blogId);
  }

  // ── Reducer ──────────────────────────────────────────────────
  /** Ladevorgang beginnt: Spinner an, alte Fehlermeldung weg. */
  #loadStarted(): void {
    this.#state.update((state) => ({ ...state, loading: true, error: null }));
  }

  /** Daten sind da: Liste übernehmen, Spinner aus. */
  #loadSucceeded(blogs: Blog[]): void {
    this.#state.update((state) => ({ ...state, blogs, loading: false }));
  }

  /** Laden fehlgeschlagen: Fehlermeldung setzen, Spinner aus. */
  #loadFailed(message: string): void {
    this.#state.update((state) => ({ ...state, error: message, loading: false }));
  }

  /** Autor gewählt: Filter im State ablegen. */
  #authorSelected(author: string): void {
    this.#state.update((state) => ({ ...state, selectedAuthor: author }));
  }

  /** Like umgeschaltet: likedByMe kippen, Zähler anpassen. */
  #likeToggled(blogId: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        const likedByMe = !blog.likedByMe;

        return { ...blog, likedByMe, likes: blog.likes + (likedByMe ? 1 : -1) };
      }),
    }));
  }
}
