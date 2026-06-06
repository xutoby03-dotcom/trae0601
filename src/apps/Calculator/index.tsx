import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let result = 0;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(String(result));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result = 0;

    switch (operation) {
      case '+':
        result = currentValue + inputValue;
        break;
      case '-':
        result = currentValue - inputValue;
        break;
      case '×':
        result = currentValue * inputValue;
        break;
      case '÷':
        result = inputValue !== 0 ? currentValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const percentage = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const buttons = [
    { label: 'C', onClick: clearAll, type: 'function' },
    { label: '±', onClick: toggleSign, type: 'function' },
    { label: '%', onClick: percentage, type: 'function' },
    { label: '÷', onClick: () => performOperation('÷'), type: 'operator' },
    { label: '7', onClick: () => inputDigit('7'), type: 'number' },
    { label: '8', onClick: () => inputDigit('8'), type: 'number' },
    { label: '9', onClick: () => inputDigit('9'), type: 'number' },
    { label: '×', onClick: () => performOperation('×'), type: 'operator' },
    { label: '4', onClick: () => inputDigit('4'), type: 'number' },
    { label: '5', onClick: () => inputDigit('5'), type: 'number' },
    { label: '6', onClick: () => inputDigit('6'), type: 'number' },
    { label: '-', onClick: () => performOperation('-'), type: 'operator' },
    { label: '1', onClick: () => inputDigit('1'), type: 'number' },
    { label: '2', onClick: () => inputDigit('2'), type: 'number' },
    { label: '3', onClick: () => inputDigit('3'), type: 'number' },
    { label: '+', onClick: () => performOperation('+'), type: 'operator' },
    { label: '0', onClick: () => inputDigit('0'), type: 'number', wide: true },
    { label: '.', onClick: inputDecimal, type: 'number' },
    { label: '=', onClick: calculate, type: 'equals' },
  ];

  return (
    <div className="flex flex-col h-full p-4" style={{ background: 'var(--color-window-background)' }}>
      <div 
        className="flex items-center justify-end p-4 mb-4 rounded text-right text-3xl font-light overflow-hidden"
        style={{ 
          background: 'var(--color-input-background)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-input-border)',
        }}
      >
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map((btn, index) => (
          <button
            key={index}
            className={`flex items-center justify-center text-lg font-medium rounded transition-all duration-150 active:scale-95 ${
              btn.wide ? 'col-span-2' : ''
            }`}
            style={{
              background: btn.type === 'equals' 
                ? 'var(--color-accent)' 
                : btn.type === 'operator'
                  ? 'var(--color-button-background)'
                  : 'var(--color-button-background)',
              color: btn.type === 'equals' ? 'white' : 'var(--color-text-primary)',
              border: '1px solid var(--color-input-border)',
            }}
            onClick={btn.onClick}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
