'use client';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-3 mb-6">
            <div className="step-indicator">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isComplete = stepNum < currentStep;

                    return (
                        <div key={stepNum} className="flex items-center">
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isActive
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40 scale-110'
                                        : isComplete
                                            ? 'bg-success-500 text-white'
                                            : 'bg-dark-600 text-gray-400'
                                    }
                `}
                            >
                                {isComplete ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNum
                                )}
                            </div>

                            {stepNum < totalSteps && (
                                <div
                                    className={`
                    w-8 sm:w-12 h-1 mx-1 rounded-full transition-colors duration-300
                    ${stepNum < currentStep ? 'bg-success-500' : 'bg-dark-600'}
                  `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <span className="text-sm text-gray-400 ml-2">
                Step {currentStep} of {totalSteps}
                {currentStep === totalSteps && totalSteps > 3 && (
                    <span className="text-primary-400 ml-1">(final step)</span>
                )}
            </span>
        </div>
    );
}
