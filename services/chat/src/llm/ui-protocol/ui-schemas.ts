/**
 * UI 响应协议 Zod Schema
 * 用于 Structured Output 约束
 */
import { z } from 'zod';

const textComponentSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  markdown: z.boolean().nullable().default(null),
});

const selectionComponentSchema = z.object({
  type: z.literal('selection'),
  title: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      description: z.string().nullable().default(null),
    }),
  ),
  mode: z.enum(['single', 'multiple']).nullable().default(null),
});

const formFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('input'),
    name: z.string(),
    label: z.string(),
    placeholder: z.string().nullable().default(null),
    required: z.boolean().nullable().default(null),
  }),
  z.object({
    type: z.literal('textarea'),
    name: z.string(),
    label: z.string(),
    placeholder: z.string().nullable().default(null),
    required: z.boolean().nullable().default(null),
  }),
  z.object({
    type: z.literal('select'),
    name: z.string(),
    label: z.string(),
    options: z.array(z.object({ value: z.string(), label: z.string() })),
    required: z.boolean().nullable().default(null),
  }),
  z.object({
    type: z.literal('date'),
    name: z.string(),
    label: z.string(),
    required: z.boolean().nullable().default(null),
  }),
  z.object({
    type: z.literal('number'),
    name: z.string(),
    label: z.string(),
    min: z.number().nullable().default(null),
    max: z.number().nullable().default(null),
    required: z.boolean().nullable().default(null),
  }),
]);

const formComponentSchema = z.object({
  type: z.literal('form'),
  title: z.string(),
  fields: z.array(formFieldSchema),
  submitLabel: z.string().nullable().default(null),
});

const confirmationComponentSchema = z.object({
  type: z.literal('confirmation'),
  title: z.string(),
  message: z.string(),
  confirmLabel: z.string().nullable().default(null),
  cancelLabel: z.string().nullable().default(null),
});

const cardComponentSchema = z.object({
  type: z.literal('card'),
  title: z.string(),
  fields: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});

const stepsComponentSchema = z.object({
  type: z.literal('steps'),
  current: z.number(),
  steps: z.array(
    z.object({
      title: z.string(),
      status: z.enum(['pending', 'active', 'completed', 'error']),
    }),
  ),
});

const tableComponentSchema = z.object({
  type: z.literal('table'),
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
    }),
  ),
  rows: z.array(z.record(z.string())),
});

const actionButtonsComponentSchema = z.object({
  type: z.literal('action_buttons'),
  buttons: z.array(
    z.object({
      label: z.string(),
      action: z.string(),
      variant: z
        .enum(['primary', 'secondary', 'danger'])
        .nullable()
        .default(null),
    }),
  ),
});

export const uiComponentSchema = z.discriminatedUnion('type', [
  textComponentSchema,
  selectionComponentSchema,
  formComponentSchema,
  confirmationComponentSchema,
  cardComponentSchema,
  stepsComponentSchema,
  tableComponentSchema,
  actionButtonsComponentSchema,
]);

export const aiUIResponseSchema = z.object({
  message: z.string().nullable().default(null),
  components: z.array(uiComponentSchema),
  context: z.record(z.any()).nullable().default(null),
});

export const uiActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('selection'), selectedIds: z.array(z.string()) }),
  z.object({ type: z.literal('form'), formData: z.record(z.any()) }),
  z.object({ type: z.literal('confirmation'), confirmed: z.boolean() }),
  z.object({ type: z.literal('button'), buttonId: z.string() }),
]);
