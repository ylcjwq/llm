/**
 * 操作按钮组
 */
import type { ActionButtonsComponent, UIAction } from './types';

interface Props {
  component: ActionButtonsComponent;
  onAction: (action: UIAction) => void;
}

export function ActionButtons({ component, onAction }: Props) {
  const handleClick = (buttonId: string) => {
    onAction({
      type: 'button',
      buttonId,
    });
  };

  const variantClass = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'border hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <div className="flex gap-2">
      {component.buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => handleClick(button.id)}
          className={`px-4 py-2 rounded-lg transition ${variantClass[button.variant || 'secondary']}`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
