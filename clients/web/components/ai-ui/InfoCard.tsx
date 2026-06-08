/**
 * 信息展示卡片
 */
import type { CardComponent } from './types';

interface Props {
  component: CardComponent;
}

export function InfoCard({ component }: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">{component.title}</h3>
      <div className="space-y-2">
        {component.fields.map((field, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{field.label}:</span>
            <span className="font-medium">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
