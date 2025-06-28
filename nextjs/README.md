# Optimized DataTable Component

This is a reusable, optimized DataTable component with infinite scroll and lazy loading capabilities.

## Features

- ✅ **Infinite Scroll**: Automatically loads more data as user scrolls
- ✅ **Lazy Loading**: Loads initial 20 rows, then loads more based on scroll speed
- ✅ **Reusable**: Can be used for any MongoDB collection
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Optimized**: Minimal re-renders and efficient data loading
- ✅ **Responsive**: Works on all screen sizes

## Usage

### 1. Define your data interface

```typescript
interface FileDocument {
  _id: string;
  name: string;
  type?: string;
  modified?: string;
  // ... other fields
}
```

### 2. Define columns

```typescript
const columns: ColumnDef<FileDocument>[] = [
  {
    key: 'name',
    label: 'Name',
    className: 'font-medium min-w-48'
  },
  {
    key: 'type',
    label: 'Type',
    className: 'min-w-24'
  },
  {
    key: 'modified',
    label: 'Modified',
    className: 'min-w-32',
    render: (value) => value ? new Date(value).toLocaleDateString() : '-'
  }
];
```

### 3. Use the DataTable

```typescript
<DataTable<FileDocument>
  apiEndpoint="/api/files"
  columns={columns}
  getItemId={(item) => item._id}
  transformResponse={(response) => ({
    data: response.files || [],
    total: response.totalRecords || 0
  })}
  pageSize={20}
  className="h-full"
/>
```

## API Requirements

Your API endpoint should accept these query parameters:
- `skip`: Number of records to skip (for pagination)
- `limit`: Number of records to return (default: 20)

And return this format:
```json
{
  "files": [...], // or "users", "data", etc.
  "totalRecords": 1000,
  "skip": 0,
  "limit": 20
}
```

## Column Definition

```typescript
interface ColumnDef<T> {
  key: string;              // Field key in your data
  label: string;            // Column header text
  render?: (value: any, item: T) => ReactNode; // Custom render function
  className?: string;       // CSS classes for the column
}
```

## Examples

### Basic Usage (Files)
See `src/app/page.tsx` for a complete example with file management.

### Custom Rendering (Users)
See `src/app/users/page.tsx` for an example with custom column rendering (badges, status indicators).

## Performance

- Initial load: 20 items
- Lazy loading: Loads more based on scroll position
- Efficient rendering: Only renders visible items
- Memory efficient: Proper cleanup and ref management

## Creating New Collection Pages

1. Create your data interface
2. Define your columns with appropriate renderers
3. Create an API route that follows the pagination pattern
4. Use the DataTable component with your configuration

The same component can be reused for any collection by just changing the:
- `apiEndpoint`
- `columns` configuration
- `transformResponse` function (if needed)
