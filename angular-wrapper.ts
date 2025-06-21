// angular-wrapper.ts
// Lightweight Angular wrapper for DataGrid
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'data-grid-angular',
  template: `<div #gridContainer class="data-grid-container"></div>`
})
export class DataGridAngularWrapper implements AfterViewInit {
  @Input() apiEndpoint!: string;
  @Input() columns: any[] = [];
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef;

  async ngAfterViewInit() {
    const module = await import('./data-grid.js');
    new module.DataGrid({
      container: this.gridContainer.nativeElement,
      apiEndpoint: this.apiEndpoint,
      columns: this.columns
    });
  }
}
