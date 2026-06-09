/**
 * 选择卡片组件
 */
import type { SelectionComponent, UIAction } from './types';

interface Props {
  component: SelectionComponent;
  onAction: (action: UIAction) => void;
}

export function SelectionCard({ component, onAction }: Props) {
  const handleSelect = (id: string) => {
    onAction({
      type: 'selection',
      selectedIds: [id],
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium">{component.title}</h3>
      <div className="grid gap-2">
        {component.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className="p-4 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="font-medium">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
