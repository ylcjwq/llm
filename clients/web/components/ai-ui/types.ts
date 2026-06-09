/**
 * UI 组件类型定义（对应后端 UIResponse）
 */

export interface TextComponent {
  type: 'text';
  content: string;
  markdown?: boolean;
}

export interface SelectionComponent {
  type: 'selection';
  title: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  multiple?: boolean;
}

export type FormField =
  | {
      type: 'input';
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: 'textarea';
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: 'select';
      name: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      required?: boolean;
    }
  | { type: 'date'; name: string; label: string; required?: boolean };

export interface FormComponent {
  type: 'form';
  title: string;
  fields: FormField[];
  submitLabel?: string;
}

export interface ConfirmationComponent {
  type: 'confirmation';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface CardComponent {
  type: 'card';
  title: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
}

export interface StepsComponent {
  type: 'steps';
  current: number;
  steps: Array<{
    title: string;
    status: 'pending' | 'active' | 'completed' | 'error';
  }>;
}

export interface TableComponent {
  type: 'table';
  columns: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, string>>;
}

export interface ActionButtonsComponent {
  type: 'action_buttons';
  buttons: Array<{
    id: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export type UIComponent =
  | TextComponent
  | SelectionComponent
  | FormComponent
  | ConfirmationComponent
  | CardComponent
  | StepsComponent
  | TableComponent
  | ActionButtonsComponent;

export interface AIUIResponse {
  components: UIComponent[];
  context?: Record<string, any>;
}

export type UIAction =
  | { type: 'selection'; selectedIds: string[] }
  | { type: 'form'; formData: Record<string, any> }
  | { type: 'confirmation'; confirmed: boolean }
  | { type: 'button'; buttonId: string };
