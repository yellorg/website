import classNames from 'classnames';
import React from 'react';
import useWallet from '../../../hooks/useWallet';
import Image from 'next/image';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';
import jwt from 'jsonwebtoken';

const SEND_CODE_COOLDOWN_SECONDS = 60;

interface PhoneInputProps {
    savePhone: (value: string) => void;
    isCodeSent: boolean;
    setIsCodeSent: (value: boolean) => void;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
    savePhone,
    isCodeSent,
    setIsCodeSent,
}: PhoneInputProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const [phoneCodeFilterValue, setPhoneCodeFilterValue] = React.useState<string>('');
    const [selectedPhoneCode, setSelectedPhoneCode] = React.useState<string>('');
    const [selectedFlagHref, setSelectedFlagHref] = React.useState<string>('https://cdn-icons-png.flaticon.com/128/197/197591.png');
    const [isInputInFocus, setIsInputInFocus] = React.useState<boolean>(false);
    const [phoneNumber, setPhoneNumber] = React.useState<string>('');

    const [isSendCodeDisabled, setIsSendCodeDisabled] = React.useState<boolean>(false);
    const [isInputInvalid, setIsInputInvalid] = React.useState<boolean>(false);
    const [cooldownLeft, setCooldownLeft] = React.useState<number>(0);
    const [countriesArray, setCountriesArray] = React.useState([]);

    const dropdownRef = React.useRef(null);
    const { account } = useWallet();
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        savePhone(`+${selectedPhoneCode}${phoneNumber}`);
    }, [selectedPhoneCode, phoneNumber]);

    React.useEffect(() => {
        const fetchCountries = async () => {
            fetch(`${window.location.origin}/api/otp/countriesFetch`, {
                method: 'POST',
            }).then((res: Response) => res.json())
            .then((data: any) => {
                setCountriesArray(data.countries);
                setSelectedPhoneCode(data.countries[0].phone_code);
                setSelectedFlagHref(data.countries[0].flag_href);
            });
        };

        fetchCountries();
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (
                dropdownRef.current &&
                !(dropdownRef.current as any).contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    const countriesFilter = React.useCallback((country: any) => {
        return (
            country.full_name
                .toLowerCase()
                .includes(phoneCodeFilterValue.toLowerCase()) ||
            country.short_name
                .toLowerCase()
                .includes(phoneCodeFilterValue.toLowerCase()) ||
            `+${country.phone_code}`.includes(phoneCodeFilterValue)
        );
    }, [phoneCodeFilterValue]);

    const handleInputChange = React.useCallback((e: any) => {
        if (/^\d{0,15}$/.test(e?.target?.value || '')) {
            setPhoneNumber(e.target.value);
        }

        if (/^.{4,16}$/.test(e?.target?.value || '')) {
            setIsInputInvalid(false);
        } else {
            setIsInputInvalid(true);
        }
    }, []);

    const handleSelectPhoneCode = React.useCallback((code: string) => {
        setSelectedPhoneCode(code);
        setIsDropdownOpen(false);
        setSelectedFlagHref(
            (countriesArray?.find((c: any) => c.phone_code === code) as any)
                ?.flag_href || ''
        );
    }, [countriesArray]);

    const handleFocus = React.useCallback(() => {
        setIsInputInFocus(true);
        setIsInputInvalid(false);
    }, []);

    const launchCooldown = React.useCallback(() => {
        setIsCodeSent(true);
        setIsSendCodeDisabled(true);
        setCooldownLeft(SEND_CODE_COOLDOWN_SECONDS);
        let timePassed = 0;

        const cooldownInterval = setInterval(() => {
            setCooldownLeft(SEND_CODE_COOLDOWN_SECONDS - ++timePassed);
        }, 1000);

        setTimeout(() => {
            clearInterval(cooldownInterval);
            setIsSendCodeDisabled(false);
        }, SEND_CODE_COOLDOWN_SECONDS * 1000);
    }, []);

    const sendCode = React.useCallback(async () => {
        fetch(`${window.location.origin}/api/otp/send`, {
            method: 'POST',
            body: jwt.sign({
                phoneNumber: `+${selectedPhoneCode}${phoneNumber}`,
                address: account,
            }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
        })
        .then(async (res) => {
            const response = await res.json();
            if (res.status === 403 && response.error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: response.error,
                }));
            } else {
                if (!res.ok) {
                    setIsInputInvalid(true);
                } else {
                    launchCooldown();
                }
            }
        })
        .catch((error: any) => {
            console.log(error);
        });
    }, [selectedPhoneCode, phoneNumber, account]);

    const renderCountryCodes = React.useMemo(() => {
        return countriesArray.filter(countriesFilter).map((country: any, index: number) => (
            <div
                className="flex flex-row cursor-pointer hover:bg-neutral-control-color-20 rounded-md px-[12px] py-[6px] gap-[6px] items-center"
                onClick={() => { handleSelectPhoneCode(country.phone_code) }}
                key={`country-${index}`}
            >
                <Image src={country.flag_href} height={24} width={24} />
                <span className="text-[16px] leading-[22px] text-neutral-control-layer-color-100 font-metro-semibold">
                    {country.short_name}
                </span>
                <span className="text-[12px] leading-[16px] text-neutral-control-layer-color-60 font-metro-regular">
                    +{country.phone_code}
                </span>
            </div>
        ));
    }, [countriesFilter, countriesArray]);

    const renderCountryCodeDropdown = React.useMemo(() => {
        return (
            <div
                className="absolute bg-body-background-color w-[calc(100%-48px)] mt-[4px] rounded-sm drop-shadow-lg z-[10]"
                ref={dropdownRef}
            >
                <div className="pt-[6px] px-[6px] pb-[8px] flex items-center border-b border-divider-color-20">
                    <input
                        className="w-full border border-divider-color-20 py-[6px] pl-[44px] shadow-sm rounded-sm"
                        type="text"
                        placeholder="Search: All"
                        value={phoneCodeFilterValue}
                        onChange={(e) => { setPhoneCodeFilterValue(e.target.value) }}
                    />
                    <span className="absolute left-[20px]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 9.29583 13.5892 10.4957 12.8907 11.4765L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L11.4765 12.8907C10.4957 13.5892 9.29583 14 8 14C4.68629 14 2 11.3137 2 8Z" fill="#AAAAAA"/>
                        </svg>
                    </span>
                </div>
                <div className="flex flex-col px-[6px] py-[8px] max-h-[170px] overflow-y-scroll gap-[6px]">
                    {renderCountryCodes}
                </div>
            </div>
        );
    }, [renderCountryCodes, phoneCodeFilterValue]);

    const cnInput = React.useMemo(() => {
        return classNames(
            'py-[10px] pl-[108px] pr-[98px] w-full leading-[22px] border border-divider-color-20 outline outline-primary-cta-color-40 rounded-sm outline-0 outline-offset-[-2px]',
            {
                'outline-2 border-transparent': isDropdownOpen || isInputInFocus,
                'pr-[119px]': isSendCodeDisabled,
                'border-system-red-20': isInputInvalid,
            },
        );
    }, [isDropdownOpen, isInputInFocus, isSendCodeDisabled, isInputInvalid]);

    const cnDropdownButton = React.useMemo(() => {
        return classNames(
            'absolute left-[calc(1.5rem+1px)] w-[100px] h-[42px] border-r border-divider-color-20 flex justify-center items-center gap-[2px] cursor-pointer',
            { 'h-[40px]': isDropdownOpen || isInputInFocus },
        );
    }, [isDropdownOpen, isInputInFocus]);

    const cnSendCodeButton = React.useMemo(() => {
        return classNames(
            'flex justify-center items-center absolute right-[calc(1.5rem+1px)] w-[90px] h-[42px] bg-primary-cta-color-60 disabled:bg-neutral-control-color-40 enabled:hover:bg-primary-cta-color-80',
            {
                'h-[40px]': (isSendCodeDisabled || isInputInvalid || phoneNumber == '')
                    && (isDropdownOpen || isInputInFocus),
                'w-[111px] gap-[3px]': isSendCodeDisabled,
            },
        );
    }, [
        isSendCodeDisabled,
        isInputInvalid,
        phoneNumber,
        isDropdownOpen,
        isInputInFocus,
    ]);

    const cnSendCodeLabel = React.useMemo(() => {
        return classNames(
            'text-[14px] leading-[22px] font-metro-semibold text-primary-cta-layer-color-60',
            { 'text-neutral-control-layer-color-40': isSendCodeDisabled },
        );
    }, [isSendCodeDisabled]);

    return (
        <div>
            <div className="flex flex-row rounded-sm shadow-sm items-center">
                <input
                    className={cnInput}
                    onFocus={handleFocus}
                    onBlur={() => { setIsInputInFocus(false); }}
                    onChange={handleInputChange}
                    value={phoneNumber}
                    type="tel"
                />
                <div
                    className={cnDropdownButton}
                    onClick={() => { setIsDropdownOpen(true); }}
                >
                    <Image src={selectedFlagHref} height={16} width={16} />
                    <span className="text-[14px] leading-[22px] font-metro-semibold text-text-color-90">+{selectedPhoneCode}</span>
                    <span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.7071 7.29289L9.99999 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68341 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#8E8E8E"/>
                        </svg>
                    </span>
                </div>
                <button
                    className={cnSendCodeButton}
                    onClick={sendCode}
                    disabled={isSendCodeDisabled || isInputInvalid || phoneNumber === ''}
                >
                    <span className={cnSendCodeLabel}>
                        {isCodeSent ? 'Resend code' : 'Send code'}
                    </span>
                    {isSendCodeDisabled && (
                        <span className="group relative flex justify-center items-center">
                            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.08333 9.33333H7.5V7H6.91667M7.5 4.66667H7.50583M12.75 7C12.75 9.89949 10.3995 12.25 7.5 12.25C4.6005 12.25 2.25 9.89949 2.25 7C2.25 4.1005 4.6005 1.75 7.5 1.75C10.3995 1.75 12.75 4.1005 12.75 7Z" stroke="#8E8E8E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="absolute hidden group-hover:inline-block p-[16px] bg-text-color-0 border-2 border-text-color-100 rounded w-max right-[-8px] sm:right-auto">
                                <span>Resend in</span>
                                {' '}
                                <span>{cooldownLeft}sec</span>
                            </div>
                        </span>
                    )}
                </button>
            </div>
            {isDropdownOpen && renderCountryCodeDropdown}
        </div>
    );
};
