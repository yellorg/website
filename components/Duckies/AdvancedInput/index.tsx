import classnames from 'classnames'
import React from 'react'

export interface AdvancedInputProps {
    /**
     * Input type such as text, password, number
     * default: text
     */
    type?: string
    /**
     * Label
     */
    label?: string | React.ReactNode
    /**
     * Input placeholder
     */
    placeholder: string
    /**
     * Input value
     */
    inputValue: string | number
    /**
     * If true, input height 12rem(48px)
     * by default, input height 9rem(36px)
     */
    lg?: boolean
    /**
     * Error message
     * If not empty, border color and label color becomes red
     */
    error?: string
    /**
     * Label classNames
     * multiple class names can be separated by space
     */
    labelClassNames?: string
    /**
     * Input field classNames
     * multiple class names can be separated by space
     */
    inputClassNames?: string
    /**
     * If true, this input field automatically get focus when the page loads.
     * default: false
     */
    autoFocus?: boolean
    /**
     * readOnly attribute.
     * default: false
     */
    readOnly?: boolean
    /**
     * disabled attribute.
     * default: false
     */
    disabled?: boolean
    /**
     * Input value change event
     */
    handleChangeInput?: (value: string) => void
    /**
     * Detect keypress event such as enter
     */
    onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    /**
     * Detect set focus event
     */
    handleFocusInput?: () => void
    /**
     * Inner button at the right side of input
     */
    rightButton?: JSX.Element
    /**
     * right button click event
     */
    handleRightButtonClick?: () => void
    /**
     * button class names
     * multiple class names can be separated by space
     */
    rightButtonClassNames?: string
    /**
     * Tooltip element
     */
    tooltip?: JSX.Element
    inputOnErrorClassName?: string
    inputNoErrorClassName?: string
    labelOnErrorClassName?: string
    heightClassName?: string
    inputMode?: 'search' | 'text' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal' | undefined
}

export const AdvancedInput = ({
    lg,
    labelClassNames,
    inputClassNames,
    rightButtonClassNames,
    type,
    label,
    placeholder,
    inputValue,
    error,
    autoFocus,
    readOnly,
    disabled,
    rightButton,
    handleChangeInput,
    handleFocusInput,
    onKeyPress,
    handleRightButtonClick,
    tooltip,
    inputOnErrorClassName,
    inputNoErrorClassName,
    labelOnErrorClassName,
    heightClassName,
    inputMode
}: AdvancedInputProps) => {
    const cnLabel = classnames(labelClassNames, error && labelOnErrorClassName)

    const cnInput = classnames(inputClassNames, heightClassName, error ? inputOnErrorClassName : inputNoErrorClassName, {
        'opacity-70': disabled,
    })

    return (
        <>
            {label && (
                <div className="flex items-center">
                    <label className={cnLabel}>{label}</label>
                    {tooltip}
                </div>
            )}
            <div className="relative">
                <input
                    type={type}
                    inputMode={inputMode}
                    value={inputValue && inputValue.toString()}
                    className={cnInput}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    readOnly={readOnly}
                    disabled={disabled}
                    onChange={(e) =>
                        handleChangeInput && handleChangeInput(e.target.value)
                    }
                    onFocus={handleFocusInput}
                    onKeyPress={onKeyPress}
                />
                {rightButton && !disabled && (
                    <div
                        className={rightButtonClassNames}
                        onClick={handleRightButtonClick}
                    >
                        {rightButton}
                    </div>
                )}
            </div>
        </>
    )
}

AdvancedInput.defaultProps = {
    inputMode: 'text',
    type: 'text',
    autoFocus: false,
    readOnly: false,
    disabled: false,
    labelClassNames: 'block text-sm font-medium text-gray-500',
    inputClassNames: 'border px-2 py-2 rounded-sm focus:outline-none focus:placeholder:text-transparent border-divider-color-20 mb-4',
    rightButtonClassNames: 'absolute inset-y-0 right-0 pr-3 flex items-center',
}
