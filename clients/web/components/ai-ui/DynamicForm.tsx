/**
 * 动态表单组件
 */
'use client';

import { useState } from 'react';
import type { FormComponent, UIAction, FormField } from './types';

interface Props {
  component: FormComponent;
  onAction: (action: UIAction) => void;
}

export function DynamicForm({ component, onAction }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction({
      type: 'form',
      formData,
    });
  };

  const renderField = (field: FormField) => {
    const baseClass = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

    switch (field.type) {
      case 'input':
        return (
          <input
            type="text"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClass}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={4}
            className={baseClass}
          />
        );
      case 'select':
        return (
          <select
            name={field.name}
            required={field.required}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClass}
          >
            <option value="">请选择</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            required={field.required}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClass}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium">{component.title}</h3>
      {component.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        {component.submitLabel || '提交'}
      </button>
    </form>
  );
}
