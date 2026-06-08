/**
 * 数据表格
 */
import type { TableComponent } from './types';

interface Props {
  component: TableComponent;
}

export function DataTable({ component }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {component.columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {component.rows.map((row, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              {component.columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-sm">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
