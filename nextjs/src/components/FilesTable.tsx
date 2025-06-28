import { InfiniteTable, TableColumn } from './InfiniteTable';
import { FaStar, FaShareAlt, FaDownload, FaEdit } from 'react-icons/fa';

interface FileData {
    _id: string;
    action: string,
    name: string;
    type: string;
    modified: string;
    modifiedBy: string;
    fileSize: number;
    location: string;
    createdBy: string;
}

const FilesTable: React.FC = () => {
    const columns: TableColumn<FileData>[] = [
        {
            key: 'action',
            header: 'Action',
            width: 60,
            render: () => (
                <div className="flex items-center gap-2">
                    <button title="Star" className="text-gray-500"><FaStar size={12} /></button>
                    <button title="Share" className="text-gray-500"><FaShareAlt size={12} /></button>
                    <button title="Download" className="text-gray-500"><FaDownload size={12} /></button>
                    <button title="Edit" className="text-gray-500"><FaEdit size={12} /></button>
                </div>
            )
        },
        {
            key: 'name',
            header: 'Name',
            width: 200,
            render: (value) => (
                <span className="text-gray-700 font-medium">{value}</span>
            )
        },
        {
            key: 'type',
            header: 'Type',
            width: 80,
            render: (value) => (
                <span className="text-gray-700">{value}</span>
            )
        },
        {
            key: 'modified',
            header: 'Modified',
            width: 150,
            render: (value) => {
                const date = new Date(value);
                return (
                    <span className="text-gray-700">
                        {`${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()} ${date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}`}
                    </span>
                );
            }
        },
        {
            key: 'modifiedBy',
            header: 'Modified By',
            width: 120,
            render: (value) => (
                <span className="text-gray-700">{value}</span>
            )
        },
        {
            key: 'fileSize',
            header: 'File Size',
            width: 80,
            render: (value) => (
                <span className="text-gray-700">{value}</span>

            )
        },
        {
            key: 'location',
            header: 'Location',
            width: 120,
            render: (value) => (
                <span className="text-gray-700">{value}</span>
            )
        },
        {
            key: 'createdBy',
            header: 'Created By',
            width: 120,
            render: (value) => (
                <span className="text-gray-700">{value}</span>
            )
        }
    ];

    const fetchFilesData = async (skip: number, limit: number) => {
        try {
            const response = await fetch(`/api/files?skip=${skip}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                data: result.files || [],
                total: result.totalRecords || 0,
                hasMore: (skip + limit) < (result.totalRecords || 0)
            };
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }
    };

    return (
        <div className="h-screen w-full">
            <InfiniteTable<FileData>
                tableName="All Files"
                columns={columns}
                fetchData={fetchFilesData}
                rowKey="_id"
                initialLimit={20}
                loadMoreThreshold={0.8}
                emptyMessage="No files found"
                loadingMessage="Loading files..."
            />
        </div>
    );
};

export default FilesTable;