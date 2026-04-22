export async function verifyRecaptcha(token) {
    if (!token) return false;
    
    try {
        const secret = process.env.RECAPTCHA_SECRET;
        
        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: params
        });
        
        const data = await response.json();
        console.log("[reCAPTCHA Debug] Google API Response:", data);
        return data.success === true;
    } catch (err) {
        console.error("Erro na verificação do reCAPTCHA:", err.message);
        return false;
    }
}
