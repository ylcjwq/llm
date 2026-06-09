/**
 * 组件映射器 - 根据 UIComponent 类型渲染对应的 React 组件
 */
import type { UIComponent, UIAction } from './types';
import { SelectionCard } from './SelectionCard';
import { DynamicForm } from './DynamicForm';
import { ConfirmationDialog } from './ConfirmationDialog';
import { InfoCard } from './InfoCard';
import { StepsProgress } from './StepsProgress';
import { DataTable } from './DataTable';
import { ActionButtons } from './ActionButtons';

interface Props {
  component: UIComponent;
  onAction: (action: UIAction) => void;
}

export function ComponentRenderer({ component, onAction }: Props) {
  switch (component.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none">
          {component.markdown ? (
            <div dangerouslySetInnerHTML={{ __html: component.content }} />
          ) : (
            <p className="text-gray-700">{component.content}</p>
          )}
        </div>
      );

    case 'selection':
      return <SelectionCard component={component} onAction={onAction} />;

    case 'form':
      return <DynamicForm component={component} onAction={onAction} />;

    case 'confirmation':
      return <ConfirmationDialog component={component} onAction={onAction} />;

    case 'card':
      return <InfoCard component={component} />;

    case 'steps':
      return <StepsProgress component={component} />;

    case 'table':
      return <DataTable component={component} />;

    case 'action_buttons':
      return <ActionButtons component={component} onAction={onAction} />;

    default:
      console.warn('不支持的组件类型:', (component as any).type);
      return (
        <div className="border border-yellow-400 bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
          [不支持的组件类型: {(component as any).type}]
        </div>
      );
  }
}
