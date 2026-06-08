/**
 * 确认对话框
 */
import type { ConfirmationComponent, UIAction } from './types';

interface Props {
  component: ConfirmationComponent;
  onAction: (action: UIAction) => void;
}

export function ConfirmationDialog({ component, onAction }: Props) {
  const handleConfirm = (confirmed: boolean) => {
    onAction({
      componentType: 'confirmation',
      payload: { confirmed },
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium">{component.title}</h3>
      <p className="text-gray-600">{component.message}</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleConfirm(true)}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {component.confirmLabel || '确认'}
        </button>
        <button
          onClick={() => handleConfirm(false)}
          className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition"
        >
          {component.cancelLabel || '取消'}
        </button>
      </div>
    </div>
  );
}
