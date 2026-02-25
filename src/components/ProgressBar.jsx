function ProgressBar({ percentage, label, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const getColor = (pct) => {
    if (pct >= 90) return 'bg-green-600'
    if (pct >= 80) return 'bg-blue-600'
    if (pct >= 70) return 'bg-amber-600'
    return 'bg-red-600'
  }

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${getColor(percentage)} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
