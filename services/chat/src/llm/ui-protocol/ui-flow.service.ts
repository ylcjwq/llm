/**
 * UI 交互流程状态机
 * 管理需求分析的完整交互闭环
 */
import { Injectable } from '@nestjs/common';
import type { AIUIResponse, UIAction } from './ui-types';

/** 会话阶段 */
export type SessionStage = 'select_type' | 'fill_detail' | 'confirm' | 'result';

/** 会话上下文 */
export interface SessionContext {
  stage: SessionStage;
  requirementType?: string;
  formData?: Record<string, any>;
}

@Injectable()
export class UIFlowService {
  private sessions = new Map<string, SessionContext>();

  /**
   * 初始化会话，返回选择需求类型的 UI
   */
  initSession(sessionId: string): AIUIResponse {
    this.sessions.set(sessionId, { stage: 'select_type' });

    return {
      components: [
        {
          type: 'text',
          content: '请选择您要提交的需求类型：',
        },
        {
          type: 'selection',
          title: '需求类型',
          options: [
            {
              id: 'functional',
              label: '功能需求',
              description: '新增或修改功能',
            },
            {
              id: 'performance',
              label: '性能需求',
              description: '性能优化或改进',
            },
            { id: 'bug', label: 'Bug修复', description: '修复现有问题' },
          ],
        },
      ],
      context: { sessionStage: 'select_type' },
    };
  }

  /**
   * 处理用户操作，推进流程
   */
  handleAction(sessionId: string, action: UIAction): AIUIResponse {
    let context = this.sessions.get(sessionId);

    // 如果 session 不存在，先初始化
    if (!context) {
      // 如果是选择操作，直接初始化为 select_type 阶段并处理
      if (
        action.type === 'selection' &&
        action.selectedIds &&
        action.selectedIds[0]
      ) {
        context = { stage: 'select_type' };
        this.sessions.set(sessionId, context);
      } else {
        return this.initSession(sessionId);
      }
    }

    switch (context.stage) {
      case 'select_type':
        return this.handleSelectType(sessionId, action, context);
      case 'fill_detail':
        return this.handleFillDetail(sessionId, action, context);
      case 'confirm':
        return this.handleConfirm(sessionId, action, context);
      default:
        return this.initSession(sessionId);
    }
  }

  /** Stage 1 → Stage 2: 选择类型后显示表单 */
  private handleSelectType(
    sessionId: string,
    action: UIAction,
    context: SessionContext,
  ): AIUIResponse {
    if (action.type !== 'selection' || !action.selectedIds[0]) {
      return this.initSession(sessionId);
    }

    const requirementType = action.selectedIds[0];
    context.stage = 'fill_detail';
    context.requirementType = requirementType;
    this.sessions.set(sessionId, context);

    const typeLabels = {
      functional: '功能需求',
      performance: '性能需求',
      bug: 'Bug修复',
    };

    return {
      components: [
        {
          type: 'text',
          content: `您选择了【${typeLabels[requirementType] || requirementType}】，请填写详细信息：`,
        },
        {
          type: 'form',
          title: '需求详情',
          fields: [
            {
              type: 'input',
              name: 'title',
              label: '需求标题',
              placeholder: '简要描述需求',
              required: true,
            },
            {
              type: 'textarea',
              name: 'description',
              label: '详细描述',
              placeholder: '详细说明需求内容、背景和目标',
              required: true,
            },
            {
              type: 'select',
              name: 'priority',
              label: '优先级',
              options: [
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ],
              required: true,
            },
            {
              type: 'date',
              name: 'deadline',
              label: '期望完成日期',
              required: false,
            },
          ],
          submitLabel: '提交',
        },
      ],
      context: { sessionStage: 'fill_detail', requirementType },
    };
  }

  /** Stage 2 → Stage 3: 填写表单后显示确认 */
  private handleFillDetail(
    sessionId: string,
    action: UIAction,
    context: SessionContext,
  ): AIUIResponse {
    if (action.type !== 'form') {
      return this.handleAction(sessionId, {
        type: 'selection',
        selectedIds: [context.requirementType || 'functional'],
      });
    }

    context.stage = 'confirm';
    context.formData = action.formData;
    this.sessions.set(sessionId, context);

    const typeLabels = {
      functional: '功能需求',
      performance: '性能需求',
      bug: 'Bug修复',
    };

    const priorityLabels = {
      high: '高',
      medium: '中',
      low: '低',
    };

    return {
      components: [
        {
          type: 'text',
          content: '请确认需求信息：',
        },
        {
          type: 'card',
          title: '需求详情',
          fields: [
            {
              label: '需求类型',
              value: typeLabels[context.requirementType || 'functional'],
            },
            { label: '需求标题', value: action.formData.title || '-' },
            { label: '详细描述', value: action.formData.description || '-' },
            {
              label: '优先级',
              value: priorityLabels[action.formData.priority] || '-',
            },
            {
              label: '期望完成日期',
              value: action.formData.deadline || '未设置',
            },
          ],
        },
        {
          type: 'confirmation',
          title: '提交分析',
          message: '确认提交后将开始需求分析流程，是否继续？',
          confirmLabel: '确认提交',
          cancelLabel: '返回修改',
        },
      ],
      context: {
        sessionStage: 'confirm',
        requirementType: context.requirementType,
        formData: context.formData,
      },
    };
  }

  /** Stage 3 → Stage 4: 确认后显示分析结果 */
  private handleConfirm(
    sessionId: string,
    action: UIAction,
    context: SessionContext,
  ): AIUIResponse {
    if (action.type !== 'confirmation') {
      return this.handleAction(sessionId, {
        type: 'form',
        formData: context.formData || {},
      });
    }

    if (!action.confirmed) {
      // 用户取消，返回表单阶段
      context.stage = 'fill_detail';
      this.sessions.set(sessionId, context);
      return this.handleAction(sessionId, {
        type: 'selection',
        selectedIds: [context.requirementType || 'functional'],
      });
    }

    context.stage = 'result';
    this.sessions.set(sessionId, context);

    return {
      components: [
        {
          type: 'text',
          content: '需求已提交，正在进行分析...',
        },
        {
          type: 'steps',
          current: 1,
          steps: [
            { title: '需求提交', status: 'completed' },
            { title: '需求解析', status: 'active' },
            { title: '可行性分析', status: 'pending' },
            { title: '生成方案', status: 'pending' },
          ],
        },
        {
          type: 'action_buttons',
          buttons: [
            { id: 'view_detail', label: '查看详情', variant: 'primary' },
            {
              id: 'new_requirement',
              label: '提交新需求',
              variant: 'secondary',
            },
            { id: 'back_home', label: '返回首页', variant: 'secondary' },
          ],
        },
      ],
      context: {
        sessionStage: 'result',
        requirementType: context.requirementType,
        formData: context.formData,
      },
    };
  }

  /**
   * 获取会话上下文
   */
  getContext(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 清除会话
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
