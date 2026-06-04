import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { SelectField } from './SelectField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { RatingField } from './RatingField';
import { FileField } from './FileField';
import type { FieldType, FormField } from '../../types/form';

export const FIELD_COMPONENT_MAP: Record<FieldType, React.ComponentType<any>> = {
  text: TextField,
  textarea: TextareaField,
  radio: RadioField,
  checkbox: CheckboxField,
  select: SelectField,
  date: DateField,
  number: NumberField,
  rating: RatingField,
  file: FileField,
};

export function getFieldComponent(type: FieldType) {
  return FIELD_COMPONENT_MAP[type];
}

export function renderPreviewField(
  field: FormField,
  value: any,
  onChange: (value: any) => void,
  disabled?: boolean
) {
  const Component = getFieldComponent(field.type);
  return <Component field={field} value={value} onChange={onChange} disabled={disabled} />;
}

export {
  TextField,
  TextareaField,
  RadioField,
  CheckboxField,
  SelectField,
  DateField,
  NumberField,
  RatingField,
  FileField,
};
