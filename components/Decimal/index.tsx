import React from 'react';

export interface DecimalProps {
    /**
     * Number of digits after dot
     */
    fixed: number;
    /**
     * thousands separator
     */
    thousSep?: string;
    /**
     * float separator
     */
    floatSep?: string;
    /**
     * Number to format
     */
    children?: string | number;
    /**
     * Children's previous value.
     * If undefined, only integer part of the number is highlighted
     */
    prevValue?: string | number;
    /**
     * Color of text
     */
    color?: string;
    /**
     * If true, the number is highlighted partialy
     */
    highlightedPartialyEnabled?: boolean;
    /**
     * Color for partial part
     */
    secondColor?: string;
}

const handleRemoveExponent = (value: DecimalProps['children']) => {
    const data = String(value).split(/[eE]/);

    if (data.length === 1) {
        return data[0];
    }

    const sign = Number(value) < 0 ? '-' : '';
    const str = data[0].replace('.', '');
    let result = '';
    let power = Number(data[1]) + 1;

    if (power < 0) {
        result = `${sign}0.`;

        while (power++) {
            result += '0';
        }

        // eslint-disable-next-line
        return result + str.replace(/^\-/,'');
    }

    power -= str.length;

    while (power--) {
        result += '0';
    }

    return `${str}${result}`;
};

const formatWithSeparators = (value: string, thousSep?: string, floatSep?: string) => {
    let fmtNum = value;

    if (thousSep !== floatSep) {
        if (floatSep) {
            fmtNum = fmtNum.replace('.', floatSep);
        }

        if ((thousSep && floatSep) || (thousSep && !floatSep && thousSep !== '.')) {
            const fmtNumParts = fmtNum.toString().split(floatSep || '.');
            fmtNumParts[0] = fmtNumParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousSep);
            fmtNum = fmtNumParts.join(floatSep || '.');
        }
    }

    return fmtNum;
};


class Decimal extends React.Component<DecimalProps> {
    public static format(value: DecimalProps['children'], precision: number | undefined = 0, thousSep?: string, floatSep?: string) {
        if (typeof value === 'undefined') {
            return '0';
        }

        let fmtVal: DecimalProps['children'] = '';
        let isPositive = true;
        let result = '0';

        if (typeof value === 'string' && parseFloat(value) < 0) {
            fmtVal = value.slice(1);
            isPositive = false;
        } else if (typeof value === 'number' && value < 0) {
            fmtVal = value * -1;
            isPositive = false;
        } else {
            fmtVal = value;
        }

        if (fmtVal !== '' && fmtVal !== 0) {
            result = handleRemoveExponent(parseFloat(`${Math.floor(Number(`${handleRemoveExponent(fmtVal)}e${precision}`))}e-${precision}`));
        }

        if (result.indexOf('.') === -1 && precision > 0) {
            result += '.';
        }

        while (result.slice(result.indexOf('.')).length <= precision) {
            result += '0';
        }

        result = formatWithSeparators(result, thousSep, floatSep);

        return isPositive ? result : `-${result}`;
    }

    public static getNumberBeforeDot(value: DecimalProps['children'], fixed: number, thousSep?: string, floatSep?: string) {
        return Decimal.format(value, 0, thousSep, floatSep);
    }

    public static getNumberAfterDot(value: DecimalProps['children'], fixed: number, thousSep?: string, floatSep?: string) {
        if (fixed === 0) {
            return;
        }

        const str = Decimal.format(value, fixed);
        let floatNum = str.slice(str.indexOf('.'));

        if (floatSep) {
            floatNum = floatNum.replace('.', floatSep);
        }

        return floatNum;
    }

    public render() {
        const {
            children,
            fixed,
            prevValue,
            thousSep,
            floatSep,
            highlightedPartialyEnabled,
            secondColor,
        } = this.props;

        if (prevValue) {
            return this.highlightNumbers(children, prevValue, fixed, thousSep, floatSep);
        } else {
            const cxSecondColor = highlightedPartialyEnabled ? secondColor : '';

            return (
                <React.Fragment>
                    <span style={{ color: this.props.color }}>
                        {Decimal.getNumberBeforeDot(children, fixed, thousSep, floatSep)}
                    </span>
                    <span style={{ color: cxSecondColor || this.props.color }}>
                        {Decimal.getNumberAfterDot(children, fixed)}
                    </span>
                </React.Fragment>
            );
        }
    }

    private highlightNumbers = (value: DecimalProps['children'], prevValue: DecimalProps['children'], fixed: number, thousSep?: string, floatSep?: string) => {
        let val = Decimal.format(value, fixed, thousSep, floatSep);
        let prev = Decimal.format(prevValue, fixed, thousSep, floatSep);
        let highlighted = '';
        const cxSecondColor = this.props.highlightedPartialyEnabled ? this.props.secondColor : '';

        while (val !== prev && val.length > 0) {
            highlighted = val[val.length - 1] + highlighted;
            val = val.slice(0, -1);
            prev = prev.slice(0, -1);
        }

        return (
            <React.Fragment>
                <span data-testid="number" style={{ color: cxSecondColor || this.props.color }}>{val}</span>
                <span data-testid="decimal" style={{ color: this.props.color }}>{highlighted}</span>
            </React.Fragment>
        );
    };
}

export {
    Decimal,
    formatWithSeparators,
};
