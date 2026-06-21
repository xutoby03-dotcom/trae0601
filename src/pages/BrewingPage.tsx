import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { BrewingParamForm } from '@/components/form/BrewingParamForm';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { Card } from '@/components/common/Card';
import { Coffee } from 'lucide-react';

export function BrewingPage() {
  const { id } = useParams<{ id: string }>();
  const { setCurrentBlindTest, currentBlindTest } = useBlindTestStore();

  useEffect(() => {
    if (id) {
      setCurrentBlindTest(id);
    }
  }, [id, setCurrentBlindTest]);

  if (!currentBlindTest || currentBlindTest.waterSamples.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center py-12">
          <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600">请先创建盲测并添加水样</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StepIndicator currentStep="brewing" />

      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-coffee-900 to-coffee-800 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <Coffee className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold">
                {currentBlindTest.coffeeName}
              </h2>
              <p className="text-coffee-200 text-sm">
                {currentBlindTest.origin} · {currentBlindTest.processMethod}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BrewingParamForm />
    </div>
  );
}
