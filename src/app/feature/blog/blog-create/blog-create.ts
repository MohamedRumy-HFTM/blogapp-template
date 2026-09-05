import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

interface BlogFormModel {
  title: string;
  content: string;
  category: string;
}

// Buchstaben (inkl. Umlaute), Ziffern und Leerzeichen
const TITLE_PATTERN = /^[\p{L}\p{N}\s]*$/u;

@Component({
  selector: 'app-blog-create',
  imports: [FormField],
  templateUrl: './blog-create.html',
  styleUrl: './blog-create.scss',
})
export class BlogCreate {
  // Model: nur die Daten
  protected readonly blogModel = signal<BlogFormModel>({
    title: '',
    content: '',
    category: 'general',
  });

  // Controller: Validierung + UI-State über dem Model
  protected readonly blogForm = form(this.blogModel, (s) => {
    required(s.title, { message: 'Titel ist erforderlich' });
    minLength(s.title, 3, { message: 'Titel braucht mindestens 3 Zeichen' });
    maxLength(s.title, 100, { message: 'Titel darf höchstens 100 Zeichen haben' });

    // 3a: Custom Validator – keine Sonderzeichen im Titel
    validate(s.title, ({ value }) => {
      if (!TITLE_PATTERN.test(value())) {
        return {
          kind: 'invalidCharacters',
          message: 'Titel darf nur Buchstaben, Zahlen und Leerzeichen enthalten',
        };
      }
      return null;
    });

    required(s.content, { message: 'Inhalt ist erforderlich' });
    minLength(s.content, 10, { message: 'Inhalt braucht mindestens 10 Zeichen' });

    // 3b: Cross-Field – Inhalt mindestens doppelt so lang wie der Titel
    validate(s.content, ({ value, valueOf }) => {
      const requiredLength = valueOf(s.title).length * 2;
      if (value().length < requiredLength) {
        return {
          kind: 'contentTooShort',
          message: `Inhalt muss mindestens ${requiredLength} Zeichen lang sein (doppelte Titellänge)`,
        };
      }
      return null;
    });

    required(s.category, { message: 'Kategorie ist erforderlich' });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();

    // submit() führt die Action nur aus, wenn das Formular valid ist
    void submit(this.blogForm, async () => {
      console.log(this.blogModel());
    });
  }
}
