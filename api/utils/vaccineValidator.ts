import { Pet, VaccineRecord, VaccinationCheckResult, VaccineType, VACCINE_RULES, VACCINE_TYPE_NAMES, EXPIRING_WARNING_DAYS } from '../../shared/types.js';
import { daysFromNow, getVaccineStatus } from './dateUtils.js';

export function validateVaccinations(
  pet: Pet,
  vaccines: VaccineRecord[]
): VaccinationCheckResult {
  const species = pet.species;
  const rules = VACCINE_RULES[species];
  
  const checks: VaccinationCheckResult['checks'] = [];
  const missingDocuments: string[] = [];
  const warnings: string[] = [];
  
  const latestVaccines = new Map<VaccineType, VaccineRecord>();
  for (const vaccine of vaccines) {
    const existing = latestVaccines.get(vaccine.type);
    if (!existing || new Date(vaccine.vaccinationDate) > new Date(existing.vaccinationDate)) {
      latestVaccines.set(vaccine.type, vaccine);
    }
  }
  
  for (const type of rules.required) {
    const vaccine = latestVaccines.get(type);
    if (!vaccine) {
      checks.push({
        type,
        name: VACCINE_TYPE_NAMES[type],
        required: true,
        hasRecord: false,
        status: 'missing',
        message: `缺少${VACCINE_TYPE_NAMES[type]}记录`
      });
      missingDocuments.push(VACCINE_TYPE_NAMES[type]);
    } else {
      const daysRemaining = daysFromNow(vaccine.expiryDate);
      const status = getVaccineStatus(vaccine.expiryDate, EXPIRING_WARNING_DAYS);
      
      checks.push({
        type,
        name: VACCINE_TYPE_NAMES[type],
        required: true,
        hasRecord: true,
        status,
        expiryDate: vaccine.expiryDate,
        daysRemaining,
        message: getStatusMessage(status, VACCINE_TYPE_NAMES[type], daysRemaining)
      });
      
      if (status === 'expiring') {
        warnings.push(`${VACCINE_TYPE_NAMES[type]}将在${daysRemaining}天后到期`);
      }
      if (status === 'expired') {
        missingDocuments.push(VACCINE_TYPE_NAMES[type]);
      }
    }
  }
  
  for (const type of rules.optional) {
    const vaccine = latestVaccines.get(type);
    if (!vaccine) {
      checks.push({
        type,
        name: VACCINE_TYPE_NAMES[type],
        required: false,
        hasRecord: false,
        status: 'missing',
        message: `建议补充${VACCINE_TYPE_NAMES[type]}记录`
      });
    } else {
      const daysRemaining = daysFromNow(vaccine.expiryDate);
      const status = getVaccineStatus(vaccine.expiryDate, EXPIRING_WARNING_DAYS);
      
      checks.push({
        type,
        name: VACCINE_TYPE_NAMES[type],
        required: false,
        hasRecord: true,
        status,
        expiryDate: vaccine.expiryDate,
        daysRemaining,
        message: getStatusMessage(status, VACCINE_TYPE_NAMES[type], daysRemaining)
      });
      
      if (status === 'expiring') {
        warnings.push(`${VACCINE_TYPE_NAMES[type]}将在${daysRemaining}天后到期`);
      }
    }
  }
  
  const requiredChecks = checks.filter(c => c.required);
  const overallPass = requiredChecks.every(c => c.status === 'valid' || c.status === 'expiring');
  
  return {
    petId: pet.id,
    overallPass,
    checks,
    missingDocuments,
    warnings
  };
}

function getStatusMessage(
  status: 'valid' | 'expiring' | 'expired' | 'missing',
  vaccineName: string,
  daysRemaining?: number
): string {
  switch (status) {
    case 'valid':
      return `${vaccineName}在有效期内，剩余${daysRemaining}天`;
    case 'expiring':
      return `${vaccineName}即将到期，剩余${daysRemaining}天，请及时接种`;
    case 'expired':
      return `${vaccineName}已过期${Math.abs(daysRemaining!)}天，必须重新接种`;
    case 'missing':
      return `缺少${vaccineName}记录`;
  }
}

export function calculateExpiryDate(
  vaccinationDate: string,
  vaccineType: VaccineType,
  species: Pet['species']
): string {
  const rules = VACCINE_RULES[species];
  const validityDays = rules.validityPeriods[vaccineType] || 365;
  
  const date = new Date(vaccinationDate);
  date.setDate(date.getDate() + validityDays);
  return date.toISOString().split('T')[0];
}
