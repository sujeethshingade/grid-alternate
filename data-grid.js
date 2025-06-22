export class DataGrid {
  constructor({ container, apiEndpoint, columns, pageSize }) {
    this.container = container;
    this.apiEndpoint = apiEndpoint;
    this.columns = columns;
    this.offset = 0;
    this.limit = pageSize || this._calculateOptimalPageSize();
    this.total = 0;
    this.isLoading = false;
    this.data = [];
    this.table = null;
    this.rowCountDiv = null;
    this.titleDiv = null;
    this.lastScrollTime = 0;
    this._init();
  }

  _calculateOptimalPageSize() {
    const viewportHeight = window.innerHeight;
    const estimatedRowHeight = 40;
    const bufferRows = 5;
    const visibleRows = Math.floor(viewportHeight / estimatedRowHeight);
    return Math.max(10, visibleRows + bufferRows);
  }

  _init() {
    // Create title
    this.titleDiv = document.createElement('h4');
    this.titleDiv.textContent = 'Sample Data';
    this.titleDiv.className = 'mb-2';
    this.container.appendChild(this.titleDiv);
    
    // Row count
    this.rowCountDiv = document.createElement('div');
    this.rowCountDiv.className = 'text-muted small mb-3';
    this.rowCountDiv.textContent = 'Loading...';
    this.container.appendChild(this.rowCountDiv);

    // Create table with proper sticky header
    this.table = document.createElement('table');
    this.table.className = 'table table-hover table-sm';
    this.table.style.cssText = 'position: relative;';
    this.table.innerHTML = this._renderHeader();
    this.container.appendChild(this.table);

    // Initial load
    this._loadRows();

    // Scroll event for lazy loading
    window.addEventListener('scroll', () => this._onScroll());
  }

  _renderHeader() {
    return `
      <thead>
        <tr style="position: sticky; top: 0; background: #f8f9fa; z-index: 10; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);">
          <th style="width: 120px; padding: 12px 8px;">Actions</th>
          <th style="width: 250px; padding: 12px 8px;">Name</th>
          <th style="width: 80px; padding: 12px 8px;">Type</th>
          <th style="width: 150px; padding: 12px 8px;">Modified</th>
          <th style="width: 130px; padding: 12px 8px;">Modified By</th>
          <th style="width: 100px; padding: 12px 8px;">File Size</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
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
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width: 120px; padding: 8px;">${this._renderActions(row)}</td>
        <td style="width: 250px; padding: 8px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.name}">${row.name}</td>
        <td style="width: 80px; padding: 8px;"><span class="badge bg-secondary">${row.type}</span></td>
        <td style="width: 150px; padding: 8px; font-size: 0.9em;">${this._formatDate(row.modified)}</td>
        <td style="width: 130px; padding: 8px; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.modifiedBy}">${row.modifiedBy}</td>
        <td style="width: 100px; padding: 8px; font-size: 0.9em;">${row.fileSize}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  _renderActions(row) {
    return `
      <div style="display: flex; gap: 4px;">
        <button class="btn btn-outline-primary btn-sm" title="Download" style="padding: 2px 6px; font-size: 0.8em;">
          <i class="fas fa-download"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm" title="Edit" style="padding: 2px 6px; font-size: 0.8em;">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-outline-info btn-sm" title="Copy" style="padding: 2px 6px; font-size: 0.8em;">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn btn-outline-success btn-sm" title="Share" style="padding: 2px 6px; font-size: 0.8em;">
          <i class="fas fa-share"></i>
        </button>
      </div>
    `;
  }

  _formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).replace(',', '');
  }

  _updateRowCount() {
    this.rowCountDiv.textContent = `Showing ${this.data.length} of ${this.total} rows`;
  }

  _onScroll() {
    if (this.isLoading || this.data.length >= this.total) return;
    
    const now = Date.now();
    const timeDiff = now - this.lastScrollTime;
    this.lastScrollTime = now;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Adjust load size based on scroll speed
    let loadSize = this._calculateOptimalPageSize();
    if (timeDiff < 50) {
      loadSize *= 2; // Load more rows for fast scrollers
    }
    
    if (scrollTop + windowHeight >= documentHeight - windowHeight * 0.1) {
      this.limit = loadSize;
      this._loadRows();
    }
  }
}