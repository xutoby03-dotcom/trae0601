import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { CoffeeInfoForm } from '@/components/form/CoffeeInfoForm';
import { WaterSampleForm } from '@/components/form/WaterSampleForm';
import { useBlindTestStore } from '@/store/useBlindTestStore';

export function CreatePage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { setCurrentBlindTest, currentBlindTest } = useBlindTestStore();

  const [showWaterForm, setShowWaterForm] = useState(false);

  useEffect(() => {
    if (id) {
      setCurrentBlindTest(id);
      setShowWaterForm(true);
    }
  }, [id, setCurrentBlindTest]);

  return (
    <div className="space-y-8">
      <StepIndicator currentStep="create" />

      {showWaterForm && currentBlindTest ? (
        <WaterSampleForm />
      ) : (
        <CoffeeInfoForm />
      )}
    </div>
  );
}
