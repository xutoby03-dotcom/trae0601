import React from 'react';
import { View, Text, Input, Textarea, Picker } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, hint, error, children, className }) => {
  return (
    <View className={classnames(styles.field, className)}>
      <View className={styles.labelRow}>
        <Text className={styles.label}>
          {required && <Text className={styles.requiredStar}>*</Text>}
          {label}
        </Text>
        {hint && <Text className={styles.hint}>{hint}</Text>}
      </View>
      <View className={classnames(styles.control, error && styles.controlError)}>
        {children}
      </View>
      {error && <Text className={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({ value, min = 0, max = 999, step = 1, onChange, suffix }) => {
  return (
    <View className={styles.stepper}>
      <View
        className={classnames(styles.stepperBtn, value <= min && styles.disabled)}
        onClick={() => value > min && onChange(value - step)}
      >
        <Text className={styles.stepperBtnText}>−</Text>
      </View>
      <View className={styles.stepperInput}>
        <Text className={styles.stepperValue}>{value}</Text>
        {suffix && <Text className={styles.stepperSuffix}>{suffix}</Text>}
      </View>
      <View
        className={classnames(styles.stepperBtn, styles.plus, value >= max && styles.disabled)}
        onClick={() => value < max && onChange(value + step)}
      >
        <Text className={styles.stepperBtnText}>+</Text>
      </View>
    </View>
  );
};

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (v: string) => void;
}

export const SegmentControl: React.FC<SegmentControlProps> = ({ options, value, onChange }) => {
  return (
    <View className={styles.segment}>
      {options.map((opt, i) => (
        <View
          key={i}
          className={classnames(
            styles.segmentItem,
            value === opt.value && styles.segmentActive
          )}
          onClick={() => onChange(opt.value)}
        >
          <Text className={classnames(styles.segmentText, value === opt.value && styles.segmentTextActive)}>
            {opt.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default FormField;
