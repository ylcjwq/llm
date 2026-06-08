/**
 * UI 响应协议类型定义
 * 用于需求分析系统的结构化 UI 交互
 */

/** 纯文本/Markdown 回复 */
export interface TextComponent {
  type: 'text';
  content: string;
  markdown?: boolean;
}

/** 单选/多选卡片 */
export interface SelectionComponent {
  type: 'selection';
  title: string;
  options: Array<{
    id?: string;
    label: string;
    description?: string;
  }>;
  multiple?: boolean;
}

/** 表单字段类型 */
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
  | { type: 'date'; name: string; label: string; required?: boolean }
  | {
      type: 'number';
      name: string;
      label: string;
      min?: number;
      max?: number;
      required?: boolean;
    };

/** 动态表单 */
export interface FormComponent {
  type: 'form';
  title: string;
  fields: FormField[];
  submitLabel?: string;
}

/** 确认对话框 */
export interface ConfirmationComponent {
  type: 'confirmation';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/** 信息展示卡片 */
export interface CardComponent {
  type: 'card';
  title: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
}

/** 步骤进度条 */
export interface StepsComponent {
  type: 'steps';
  current: number;
  steps: Array<{
    title: string;
    status: 'pending' | 'active' | 'completed' | 'error';
  }>;
}

/** 数据表格 */
export interface TableComponent {
  type: 'table';
  columns: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, string>>;
}

/** 操作按钮组 */
export interface ActionButtonsComponent {
  type: 'action_buttons';
  buttons: Array<{
    id?: string;
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

/** UI 响应联合类型 */
export type UIComponent =
  | TextComponent
  | SelectionComponent
  | FormComponent
  | ConfirmationComponent
  | CardComponent
  | StepsComponent
  | TableComponent
  | ActionButtonsComponent;

/** AI 返回的完整 UI 响应 */
export interface AIUIResponse {
  components: UIComponent[];
  context?: Record<string, any>;
}

/** 用户操作回传数据 */
export type UIAction =
  | { type: 'selection'; selectedIds: string[] }
  | { type: 'form'; formData: Record<string, any> }
  | { type: 'confirmation'; confirmed: boolean }
  | { type: 'button'; buttonId: string };
