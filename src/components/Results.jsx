import { formatCurrency } from '../utils/calculations';

const Results = ({ 
  totalInvested, 
  futureValue, 
  totalReturns,
  labels = {
    invested: "Total Invested",
    returns: "Expected Returns",
    future: "Future Value"
  }
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Investment Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
          <p className="text-sm font-medium text-blue-800 mb-2">{labels.invested}</p>
          <p className="text-2xl font-bold text-blue-700">₹{formatCurrency(totalInvested)}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
          <p className="text-sm font-medium text-green-800 mb-2">{labels.returns}</p>
          <p className="text-2xl font-bold text-green-700">₹{formatCurrency(totalReturns)}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
          <p className="text-sm font-medium text-purple-800 mb-2">{labels.future}</p>
          <p className="text-2xl font-bold text-purple-700">₹{formatCurrency(futureValue)}</p>
        </div>
      </div>
    </div>
  );
};

export default Results;