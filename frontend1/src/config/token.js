export function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000; // exp в секундах → в миллисекунды

        return Date.now() > exp; // true = истёк
    } catch (e) {
        return true; // токен битый → считаем истёкшим
    }
}
