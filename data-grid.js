export class DataGrid {
  constructor({ container, apiEndpoint, columns, pageSize }) {
    this.container = container;
    this.apiEndpoint = apiEndpoint;
    this.columns = columns;
    this.offset = 0;
    this.limit = pageSize || this._calculateOptimalPageSize(); // Dynamic calculation
    this.total = 0;
    this.isLoading = false;
    this.data = [];
    this.table = null;
    this.rowCountDiv = null;
    this.lastScrollTime = 0;
    this.scrollSpeed = 0;
    this._init();
  }

  _calculateOptimalPageSize() {
    // Calculate based on viewport height and estimated row height
    const viewportHeight = window.innerHeight;
    const estimatedRowHeight = 50; // Approximate height of each table row
    const bufferRows = 5; // Extra rows for smooth scrolling
    
    const visibleRows = Math.floor(viewportHeight / estimatedRowHeight);
    return Math.max(10, visibleRows + bufferRows); // Minimum 10 rows
  }

  _init() {
    // Create row count display
    this.rowCountDiv = document.createElement('div');
    this.rowCountDiv.className = 'mb-2 fw-bold';
    this.container.appendChild(this.rowCountDiv);

    // Create table
    this.table = document.createElement('table');
    this.table.className = 'table table-bordered table-hover';
    this.table.innerHTML = this._renderHeader();
    this.container.appendChild(this.table);

    // Initial load
    this._loadRows();

    // Scroll event for lazy loading
    window.addEventListener('scroll', () => this._onScroll());
  }

  _renderHeader() {
    return `<thead class="table-light">
      <tr>
        <th style="width:120px; position:sticky; top:0; background:#f8f9fa;">Actions</th>
        <th style="position:sticky; top:0; background:#f8f9fa;">Name</th>
        <th style="position:sticky; top:0; background:#f8f9fa;">Type</th>
        <th style="position:sticky; top:0; background:#f8f9fa;">Modified</th>
        <th style="position:sticky; top:0; background:#f8f9fa;">Modified By</th>
        <th style="position:sticky; top:0; background:#f8f9fa;">File Size</th>
      </tr>
    </thead><tbody></tbody>`;
  }

  async _loadRows() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.rowCountDiv.textContent = 'Loading...';
    try {
      const resp = await fetch(`${this.apiEndpoint}?offset=${this.offset}&limit=${this.limit}`);
      const json = await resp.json();
      this.total = json.total;
      this.data = this.data.concat(json.data);
      this._appendRows(json.data);
      this.offset += this.limit;
      this._updateRowCount();
    } catch (e) {
      this.rowCountDiv.textContent = 'Failed to load data.';
    } finally {
      this.isLoading = false;
    }
  }

  _appendRows(rows) {
    const tbody = this.table.querySelector('tbody');
    for (const row of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${this._renderActions(row)}</td>
        <td>${row.name}</td>
        <td>${row.type}</td>
        <td>${this._formatDate(row.modified)}</td>
        <td>${row.modifiedBy}</td>
        <td>${row.fileSize}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  _renderActions(row) {
    // Font Awesome icons (assume FA is loaded)
    return `
      <button class="btn btn-link p-0 me-2" title="Download"><i class="fas fa-download"></i></button>
      <button class="btn btn-link p-0 me-2" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn btn-link p-0 me-2" title="Copy"><i class="fas fa-copy"></i></button>
      <button class="btn btn-link p-0" title="Share"><i class="fas fa-share"></i></button>
    `;
  }

  _formatDate(dateStr) {
    const d = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    return d.toLocaleString('en-GB', options).replace(',', '');
  }

  _updateRowCount() {
    this.rowCountDiv.textContent = `Showing ${this.data.length} of ${this.total} rows`;
  }

  _onScroll() {
    if (this.isLoading || this.data.length >= this.total) return;
    
    // Calculate scroll speed
    const now = Date.now();
    const timeDiff = now - this.lastScrollTime;
    this.lastScrollTime = now;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Adjust load size based on scroll speed
    let loadSize = this._calculateOptimalPageSize();
    if (timeDiff < 50) { // Fast scrolling
      loadSize *= 2; // Load more rows for fast scrollers
    }
    
    if (scrollTop + windowHeight >= documentHeight - windowHeight) {
      this.limit = loadSize;
      this._loadRows();
    }
  }
}
