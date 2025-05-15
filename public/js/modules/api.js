const API_BASE_URL = 'http://localhost:3000';

export function formatPhone(phone) {
  const nums = phone.toString().replace(/\D/g, '');
  if (nums.length === 12) {
    return nums.replace(/(\d{2})(\d{2})(\d{5})(\d{3})/, '+$1 ($2) $3-$4');
  }
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
}