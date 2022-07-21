import React from 'react';
import { DuckiesModalWindow } from '../DuckiesModalWindow';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';
import useWallet from '../../../hooks/useWallet';
import { setIsPhoneOtpCompleted } from '../../../features/globals/globalsSlice';
import { useAppDispatch } from '../../../app/hooks';
import jwt from 'jsonwebtoken';
import { Decimal } from '../../Decimal';
import { dispatchAlert } from '../../../app/store';
import { Captcha } from '../Captcha';

interface OTPModalProps {
    bounty: string | number;
    bountyDescription?: string;
    bountyStatus?: string;
    isOpen: boolean;
    setIsOpen: any;
    isClaimed?: boolean;
}

export const OTPModal: React.FC<OTPModalProps> = ({
    bounty,
    bountyDescription,
    bountyStatus,
    isOpen,
    setIsOpen,
    isClaimed,
}: OTPModalProps) => {
    const [isSuccess, setIsSuccess] = React.useState<boolean>(!!isClaimed);
    const [isOtpIncorrect, setIsOtpIncorrect] = React.useState<boolean>(false);
    const [phone, setPhone] = React.useState<string>('');
    const [otp, setOtp] = React.useState<string>('');
    const [verifiedPhone, setVerifiedPhone] = React.useState<string>('');
    const [isCodeSent, setIsCodeSent] = React.useState<boolean>(false);
    const [isCaptchaResolved, setIsCaptchaResolved] = React.useState<boolean>(false);
    const [shouldResetCaptcha, setShouldResetCaptcha] = React.useState<boolean>(false);

    const { account } = useWallet();
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        setShouldResetCaptcha(true);
    }, [otp]);

    React.useEffect(() => {
        setIsSuccess(!!isClaimed);
    }, [isClaimed]);

    const fetchPhone = React.useCallback(async () => {
        const { phoneNumber } = await (await fetch(
            `${window.location.origin}/api/otp/fetchPhoneNumber`, {
                method: 'POST',
                body: jwt.sign({
                    account,
                }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
            }
        )).json();

        setVerifiedPhone(phoneNumber);
    }, []);

    React.useEffect(() => {
        if (isSuccess && account) {
            fetchPhone();
        }
    }, [account, isSuccess]);

    const handleSubmit = React.useCallback(async () => {
        setShouldResetCaptcha(true);
        setIsCaptchaResolved(false);

        fetch(`${window.location.origin}/api/otp/verify`, {
            method: 'POST',
            body: jwt.sign({
                phoneNumber: phone,
                otp,
                address: account,
            }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
        }).then((res: Response) => res.json())
        .then((data: any) => {
            if (data.error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: data.error,
                }));
            } else if (data.success) {
                setIsSuccess(true);
                dispatch(setIsPhoneOtpCompleted(true));
            } else {
                setIsOtpIncorrect(true);
            }
        });
    }, [otp, phone, account, dispatch]);

    const handleResolveCaptcha = React.useCallback(() => {
        setIsCaptchaResolved(true);
        setShouldResetCaptcha(false);
    }, []);

    const renderBounty = React.useMemo(() => {
        return (
            <div className="bg-primary-cta-color-10 w-full flex justify-center items-center py-[12px] gap-[8px]">
                <span className="text-[24px] leading-[32px] font-gilmer-medium text-text-color-100">
                    {Decimal.format(+bounty || 0, 0, ',')}
                </span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.0895 2.22222H3.33398V17.7778H10.0895C14.6673 17.7778 17.534 14.4889 17.534 10C17.534 5.42222 14.6229 2.22222 10.0895 2.22222ZM10.0229 15.0222H6.35621V4.95556H10.0229C12.6895 4.95556 14.4673 6.97778 14.4673 9.93333C14.4673 12.9333 12.6895 15.0222 10.0229 15.0222Z" fill="#ECAA00"/>
                    <path d="M6.11719 0H8.33941V4.44444H6.11719V0Z" fill="#ECAA00"/>
                    <path d="M6.11719 15.5556H8.33941V20H6.11719V15.5556Z" fill="#ECAA00"/>
                    <path d="M9.45052 0H11.6727V4.44444H9.45052V0Z" fill="#ECAA00"/>
                    <path d="M9.45052 15.5556H11.6727V20H9.45052V15.5556Z" fill="#ECAA00"/>
                </svg>
            </div>
        );
    }, [bounty]);

    const renderBody = React.useMemo(() => {
        return (
            <div className="flex flex-col items-center w-full gap-[16px]">
                {renderBounty}
                <span className="text-center text-[14px] leading-[22px] font-metro-medium text-text-color-100">
                    {bountyDescription}
                </span>
                <PhoneInput
                    savePhone={setPhone}
                    isCodeSent={isCodeSent}
                    setIsCodeSent={setIsCodeSent}
                />
                <OTPInput
                    saveOtp={setOtp}
                    isOtpIncorrect={isOtpIncorrect}
                    setIsOtpIncorrect={setIsOtpIncorrect}
                />
                {otp.length == 6 && (
                    <div className="flex justify-center">
                        <Captcha
                            shouldResetCaptcha={shouldResetCaptcha}
                            setShouldResetCaptcha={setShouldResetCaptcha}
                            handleResolveCaptcha={handleResolveCaptcha}
                            handleExpire={() => { setIsCaptchaResolved(false); }}
                        />
                    </div>
                )}
                {(otp.length !== 6 || !isCodeSent || !isCaptchaResolved) ? (
                    <div className="bg-neutral-control-color-40 font-metro-bold text-neutral-control-layer-color-40 w-full text-center py-[6px] mt-[8px]">
                        Submit
                    </div>
                ) : (
                    <button
                        className="button button--outline button--secondary button--shadow-secondary w-[calc(100%-4px)] mt-[8px] ml-[4px]"
                        onClick={handleSubmit}
                    >
                        <span className="button__inner flex justify-center">Submit</span>
                    </button>
                )}
            </div>
        );
    }, [
        otp,
        handleSubmit,
        renderBounty,
        isOtpIncorrect,
        isCodeSent,
        bountyDescription,
        isCaptchaResolved,
        shouldResetCaptcha,
        handleResolveCaptcha,
    ]);

    const renderSuccess = React.useMemo(() => {
        return (
            <div className="flex flex-col items-center w-full">
                <span className="text-base text-text-color-100 font-metro-semibold mb-3">Phone number: {verifiedPhone} was verified.</span>
                {renderBounty}
                {bountyStatus === 'claim' && 
                    <span className="text-base text-center text-text-color-100 font-metro-medium mt-5">Your reward for completing this quest can be claimed now</span>
                }
                <button
                    className="button button--outline button--secondary button--shadow-secondary mt-[24px]"
                    onClick={() => { setIsOpen(false) }}
                >
                    <span className="button__inner">OK</span>
                </button>
            </div>
        );
    }, [renderBounty, verifiedPhone, setIsOpen, bountyStatus]);

    return (
        <DuckiesModalWindow
            isOpen={isOpen}
            headerContent={isSuccess ? 'Ducking amazing!' : 'Phone verification'}
            bodyContent={isSuccess ? renderSuccess : renderBody}
            setIsOpen={setIsOpen}
        />
    );
};
