/**
 * 步骤进度条
 */
import type { StepsComponent } from './types';

interface Props {
  component: StepsComponent;
}

export function StepsProgress({ component }: Props) {
  return (
    <div className="space-y-2">
      {component.steps.map((step, index) => {
        const isActive = index === component.current;
        const isCompleted = index < component.current;
        const statusColor = {
          completed: 'bg-green-500',
          active: 'bg-blue-500',
          pending: 'bg-gray-300',
          error: 'bg-red-500',
        }[step.status];

        return (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${statusColor}`}>
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className={`flex-1 ${isActive ? 'font-medium' : 'text-gray-600'}`}>
              {step.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
