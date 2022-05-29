import { Decimal } from '../components/Decimal';

export const convertNumberToLiteral = (value: number, literals = ['K', 'M', 'B', 'T']) => {
    // output: less than thousand - 143.00, thousands - 1.43K, millions - 1.43M, billions - 1.43B, trillions - 1.43T
    if (value >= 1e12 && !!literals[3])
        return Decimal.format((value / 1e12), 2, ',') + literals[3];
    if (value >= 1e9 && value < 1e12 && !!literals[2] || (value >= 1e12 && !!literals[2] && !literals[3]))
        return Decimal.format((value / 1e9), 2, ',') + literals[2];
    if (value >= 1e6 && value < 1e9 && !!literals[1] || (value >= 1e9 && !!literals[1] && !literals[2] && !literals[3]))
        return Decimal.format((value / 1e6), 2, ',') + literals[1];
    if (value >= 1e3 && value < 1e6 && !!literals[0] || (value >= 1e6 && !!literals[0] && !literals[1] && !literals[2] && !literals[3]))
        return Decimal.format((value / 1e3), 2, ',') + literals[0];
    return Decimal.format((value), 2, ',');
};
