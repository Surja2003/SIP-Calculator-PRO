import Range from './Range';

const CalculatorForm = ({ 
  formData, 
  onAmountChange, 
  onRangeChange, 
  onInflationChange,
  amountLabel,
  amountMin = 500,
  showDuration = true,
  showInflation = true
}) => {
  return (
    <div>
      <div className="mb-8">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {amountLabel}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          <input
            id="amount"
            type="text"
            value={formData.amount}
            onChange={onAmountChange}
            className="block w-full pl-8 pr-4 py-3 text-lg border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            min={amountMin}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">Enter amount</p>
      </div>

      {showDuration && (
        <Range
          id="years"
          label="Select Duration"
          value={formData.years}
          min={1}
          max={30}
          onChange={onRangeChange('years')}
          suffix=" Yrs"
        />
      )}

      <Range
        id="annualRate"
        label="Expected Rate of Return"
        value={formData.annualRate}
        min={8}
        max={30}
        onChange={onRangeChange('annualRate')}
        suffix="%"
      />

      {showInflation && (
        <div className="flex items-center mb-6">
          <input
            id="includeInflation"
            type="checkbox"
            checked={formData.includeInflation}
            onChange={onInflationChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="includeInflation" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Calculate with Inflation
          </label>
        </div>
      )}

      {formData.includeInflation && (
        <Range
          id="inflation"
          label="Expected Inflation Rate"
          value={formData.inflation}
          min={2}
          max={15}
          onChange={onRangeChange('inflation')}
          suffix="%"
        />
      )}
    </div>
  );
};

export default CalculatorForm;