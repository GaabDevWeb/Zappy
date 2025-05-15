import { apiRequest, formatPhone } from './api.js';

export function initContactsSection() {
  const saveContactBtn = document.getElementById('save-contact-btn');
  saveContactBtn.addEventListener('click', saveContact);
}

export async function loadContacts() {
  const contactsContainer = document.getElementById('contacts-container');
  const contactsList = document.getElementById('contacts-list');
  
  try {
    contactsList.innerHTML = '<div class="spinner"></div>';
    const contacts = await apiRequest('/get-contacts');
    
    if (contacts.length === 0) {
      contactsList.innerHTML = '<p class="empty-message">Nenhum contato cadastrado</p>';
      return;
    }

    contactsList.innerHTML = contacts.map(contact => `
      <div class="contact-card" data-id="${contact.id}">
        <div class="contact-info">
          <strong>${contact.name || 'Sem nome'}</strong>
          <span>${contact.phone ? formatPhone(contact.phone) : 'Sem telefone'}</span>
        </div>
        <button class="delete-contact-btn" data-id="${contact.id}">🗑️</button>
      </div>
    `).join('');

    document.querySelectorAll('.delete-contact-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        
        if (confirm(`Deseja realmente excluir este contato?`)) {
          try {
            await apiRequest('/delete-contact', 'POST', { id });
            loadContacts();
          } catch (err) {
            console.error('Erro:', err);
            alert(`Erro ao excluir contato: ${err.message}`);
          }
        }
      });
    });

  } catch (err) {
    console.error('Erro detalhado:', err);
    contactsList.innerHTML = `<p class="error-message">Erro ao carregar contatos: ${err.message}</p>`;
  }
}

async function saveContact() {
  const contactName = document.getElementById('contact-name');
  const contactPhone = document.getElementById('contact-phone');
  const name = contactName.value.trim();
  const phone = contactPhone.value.trim();
  
  try {
    await apiRequest('/save-contact', 'POST', { name, phone });
    contactName.value = '';
    contactPhone.value = '';
    await loadContacts();
  } catch (err) {
    console.error('Erro completo:', err);
    alert(`Erro ao salvar contato: ${err.message}`);
  }
}