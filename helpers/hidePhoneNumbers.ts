export function hidePhoneNumber(phone: string) {
    return phone?.replace(phone.slice(2, -3), (match: string) => {
        return '*'.repeat(match.length);
    });
}
