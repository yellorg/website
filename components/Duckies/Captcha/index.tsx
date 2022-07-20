import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface CaptchaProps {
    shouldResetCaptcha: boolean,
    setShouldResetCaptcha: (value: boolean) => void,
    handleResolveCaptcha: () => void,
}

export const Captcha = ({
    shouldResetCaptcha,
    setShouldResetCaptcha,
    handleResolveCaptcha,
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
            className="mb-5 inline-block scale-80 lg:scale-100"
            hl="en"
        />
    );
};
