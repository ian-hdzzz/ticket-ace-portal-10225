// API function to send temporary password email
export const sendTempPasswordEmail = async (email: string, name: string, tempPassword: string) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    const url = `${API_BASE_URL}/api/email/send-temp-password`;
    
    console.log('📧 Sending temp password email...');
    console.log('   - URL:', url);
    console.log('   - Email:', email);
    console.log('   - Name:', name);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Para enviar cookies
      body: JSON.stringify({
        email,
        name,
        tempPassword
      })
    });

    const data = await response.json();
    
    console.log('📧 Email API Response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar credenciales por correo');
    }

    return data;
  } catch (error) {
    console.error('❌ Error sending temp password email:', error);
    throw error;
  }
};
