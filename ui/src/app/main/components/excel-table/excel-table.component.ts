import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-excel-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-table.component.html',
  styleUrl: './excel-table.component.scss'
})
export class ExcelTableComponent {
  books = [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960, genre: 'Fiction' },
    { title: '1984', author: 'George Orwell', year: 1949, genre: 'Dystopian' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, genre: 'Classic' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', year: 1951, genre: 'Fiction' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'Romance' },
    { title: 'Moby-Dick', author: 'Herman Melville', year: 1851, genre: 'Adventure' },
    { title: 'Brave New World', author: 'Aldous Huxley', year: 1932, genre: 'Science Fiction' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'Fantasy' },
    { title: 'War and Peace', author: 'Leo Tolstoy', year: 1869, genre: 'Historical' },
    { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', year: 1866, genre: 'Philosophical' }
  ];

  editCell: { index: number, column: string } | null = null;
  draggedRowIndex: number | null = null;

  enableEdit(index: number, column: string) {
    this.editCell = { index, column };
  }

  isEditing(index: number, column: string): boolean {
    return this.editCell?.index === index && this.editCell?.column === column;
  }

  disableEdit() {
    this.editCell = null;
  }

  drag(event: DragEvent, index: number) {
    this.draggedRowIndex = index;
    event.dataTransfer?.setData('text', index.toString());
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  drop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedRowIndex !== null) {
      this.books.splice(this.draggedRowIndex, 1);
      this.draggedRowIndex = null;
    }
  }
}
