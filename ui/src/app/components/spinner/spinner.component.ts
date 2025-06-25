import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-spinner',
  imports: [ CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() color: string = 'stroke-red-700'; // Default color
  @Input() size: string = 'spinner-xs';  // Default size

  ngOnInit() {
    console.log(this.color, this.size)
  }
}
