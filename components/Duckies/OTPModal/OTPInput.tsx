import classNames from 'classnames';
import React from 'react';

interface OTPInputProps {
    saveOtp: any;
    isOtpIncorrect?: boolean;
    setIsOtpIncorrect?: any;
};

export const OTPInput: React.FC<OTPInputProps> = ({
    saveOtp,
    isOtpIncorrect,
    setIsOtpIncorrect,
}: OTPInputProps) => {
    const [isOtpInFocus, setIsOtpInFocus] = React.useState<boolean>(false);
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
    const [values, setValues] = React.useState<string[]>(Array.from(new Array(6), () => ''));

    React.useEffect(() => {
        if (isOtpInFocus) {
            setIsOtpIncorrect(false);
        }
    }, [isOtpInFocus]);

    React.useEffect(() => {
        saveOtp(values.reduce((prev: string, cur: string) => prev + cur, ''));
    }, [values]);

    React.useEffect(() => {
        const lastNonNull = values.length - 1 - [...values].reverse().findIndex(value => value !== '');
        if (lastNonNull != values.length && selectedIndex <= lastNonNull && selectedIndex > 0) {
            setFocusedIndex(selectedIndex);
            return;
        }

        values.some((value: string, index: number) => {
            if (!value || index == selectedIndex) {
                setFocusedIndex(index);
                return true;
            }
        });
    }, [values, selectedIndex]);

    const handleInput = React.useCallback((e: any) => {
        if (focusedIndex < values.length) {
            setValues(
                ([] as Array<string>).concat(
                    values.slice(0, focusedIndex),
                    e.target.value[0],
                    values.slice(focusedIndex + 1),
                ),
            );
            setSelectedIndex(focusedIndex + 1 >= values.length ? values.length - 1 : focusedIndex + 1);
        }
    }, [values, focusedIndex]);

    const handleKeyDown = React.useCallback((e: any) => {
        if (e.key == 'Backspace') {
            setValues(
                ([] as Array<string>).concat(
                    values.slice(0, focusedIndex),
                    '',
                    values.slice(focusedIndex + 1),
                ),
            );
            setSelectedIndex(focusedIndex - 1);
        }

        if (e.key == 'ArrowLeft') {
            setSelectedIndex(focusedIndex - 1);
        }

        if (e.key == 'ArrowRight') {
            setSelectedIndex(focusedIndex + 1 >= values.length ? values.length - 1 : focusedIndex + 1);
        }
    }, [values, focusedIndex]);

    const renderSingleInput = React.useCallback((value: string, index: number) => {
        const cnSingleInputBox = classNames(
            'relative outline outline-offset-[-1px] outline-primary-cta-color-40 outline-0',
            { 'outline-1': isOtpInFocus && (focusedIndex == index) },
        );
        const cnSingleInput = classNames(
            'bg-input-background-color border border-divider-color-20 rounded-sm p-[11px] shadow-sm',
            { 'border-system-red-20': isOtpIncorrect },
        );

        return (
            <div key={`otp-${index}`} className={cnSingleInputBox}>
                <input
                    className="absolute w-full h-full bg-transparent outline outline-0 focus:outline-none outline-offset-[-1px] outline-primary-cta-color-40 caret-transparent"
                    onFocus={() => {
                        setSelectedIndex(index);
                        setIsOtpInFocus(true);
                    }}
                    onBlur={() => {
                        setFocusedIndex(-1);
                        setSelectedIndex(-1);
                        setIsOtpInFocus(false);
                    }}
                    onClick={() => {setSelectedIndex(index)}}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    value={''}
                />
                <div className={cnSingleInput}>
                    {value ? (
                        <div className="w-[20px] h-[20px] flex justify-center items-center text-[16px] font-metro-semibold text-text-color-100">
                             {value}
                        </div>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z" fill="#BDBDBD"/>
                        </svg>
                    )}
                </div>
            </div>
        );
    }, [isOtpInFocus, focusedIndex, handleInput, handleKeyDown, isOtpIncorrect]);

    const renderInputs = React.useMemo(() => {
        return values.map(renderSingleInput);
    }, [values, renderSingleInput]);

    return <div className="w-full flex justify-between">{renderInputs}</div>;
};
