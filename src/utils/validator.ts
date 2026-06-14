import type { BookingFormData, ValidationErrors } from '@/types';

const PLATE_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5,6}$/;

export function validateBookingForm(data: BookingFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name?.trim()) {
    errors.name = '请输入访客姓名';
  } else if (data.name.trim().length > 20) {
    errors.name = '姓名长度不超过20字';
  }

  if (!data.company?.trim()) {
    errors.company = '请输入所属公司';
  } else if (data.company.trim().length > 50) {
    errors.company = '公司名称长度不超过50字';
  }

  if (!data.plateNumber?.trim()) {
    errors.plateNumber = '车牌号必填，无车牌不能发券';
  } else {
    const p = data.plateNumber.trim().toUpperCase();
    if (!PLATE_REGEX.test(p)) {
      errors.plateNumber = '请输入正确的车牌号格式（如：京A12345）';
    }
  }

  if (!data.departmentId) {
    errors.departmentId = '请选择到访部门';
  }

  if (!data.meetingRoom?.trim()) {
    errors.meetingRoom = '请输入会议室';
  } else if (data.meetingRoom.trim().length > 30) {
    errors.meetingRoom = '会议室名称过长';
  }

  if (!data.expectedArrival) {
    errors.expectedArrival = '请选择预计到达时间';
  }

  if (!data.expectedDeparture) {
    errors.expectedDeparture = '请选择预计离开时间';
  } else if (
    data.expectedArrival &&
    new Date(data.expectedDeparture).getTime() <= new Date(data.expectedArrival).getTime()
  ) {
    errors.expectedDeparture = '离开时间必须晚于到达时间';
  }

  if (!data.hostId) {
    errors.hostId = '请选择接待人';
  }

  return errors;
}

export function isValidPlate(plate: string): boolean {
  if (!plate?.trim()) return false;
  return PLATE_REGEX.test(plate.trim().toUpperCase());
}
