import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface CaptchaProps {
    shouldResetCaptcha: boolean,
    setShouldResetCaptcha: (value: boolean) => void,
    handleResolveCaptcha: () => void,
    handleExpire?: () => void,
}

export const Captcha = ({
    shouldResetCaptcha,
    setShouldResetCaptcha,
    handleResolveCaptcha,
    handleExpire,
}: CaptchaProps) => {
    const captchaRef: any = React.useRef();

    React.useEffect(() => {
        if (shouldResetCaptcha) {
            captchaRef?.current?.reset();
            setShouldResetCaptcha(false);
        }
    }, [shouldResetCaptcha, captchaRef]);

    return (
        <ReCAPTCHA
            ref={captchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || 'changeme'}
            onChange={handleResolveCaptcha}
            onExpired={handleExpire}
            className="inline-block scale-80 lg:scale-100"
            hl="en"
        />
    );
};
