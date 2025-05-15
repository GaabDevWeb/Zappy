import { apiRequest, formatPhone } from './api.js';

export function initMassSendSection() {
  const showSenderBtn = document.getElementById('show-sender-btn');
  const senderContainer = document.getElementById('sender-container');
  
  showSenderBtn.addEventListener('click', () => {
    senderContainer.style.display = senderContainer.style.display === 'none' ? 'block' : 'none';
    if (senderContainer.style.display === 'block') {
      loadMessagesForSelect();
      loadContactsForCheckboxes();
    }
  });

  document.getElementById('select-all-contacts').addEventListener('change', (e) => {
    document.querySelectorAll('input[name="selected-contacts"]').forEach(checkbox => {
      checkbox.checked = e.target.checked;
    });
  });

  document.getElementById('send-mass-message-btn').addEventListener('click', sendMassMessages);
}

async function loadMessagesForSelect() {
  try {
    const messages = await apiRequest('/get-messages');
    const messageSelect = document.getElementById('message-select');
    messageSelect.innerHTML = messages.map(msg => 
      `<option value="${msg.id}" title="${msg.text}">${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}</option>`
    ).join('');
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err);
    document.getElementById('message-select').innerHTML = '<option value="">Erro ao carregar mensagens</option>';
  }
}

async function loadContactsForCheckboxes() {
  try {
    const contacts = await apiRequest('/get-contacts');
    const contactsCheckboxes = document.getElementById('contacts-checkboxes');
    
    contactsCheckboxes.innerHTML = contacts.map(contact => `
      <div class="contact-checkbox-item">
        <input type="checkbox" 
               name="selected-contacts" 
               value="${contact.phone}" 
               id="contact-${contact.id}">
        <label for="contact-${contact.id}">
          ${contact.name} (${formatPhone(contact.phone)})
        </label>
      </div>
    `).join('');

  } catch (err) {
    console.error('Erro ao carregar contatos:', err);
    document.getElementById('contacts-checkboxes').innerHTML = '<p class="error-message">Erro ao carregar contatos</p>';
  }
}

function validatePhoneNumbers(contacts) {
  return contacts.map(contact => {
    const cleanPhone = contact.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return {
      ...contact,
      phone: formattedPhone
    };
  });
}

async function sendMassMessages() {
  const selectedOption = document.getElementById('message-select').selectedOptions[0];
  if (!selectedOption) {
    return alert('Selecione uma mensagem!');
  }
  
  const messageId = selectedOption.value;

  // Buscar o texto completo da mensagem pelo ID
  let messageText = '';
  try {
    const messages = await apiRequest('/get-messages');
    const selectedMessage = messages.find(msg => String(msg.id) === String(messageId));
    if (!selectedMessage) {
      return alert('Mensagem não encontrada!');
    }
    messageText = selectedMessage.text;
  } catch (err) {
    return alert('Erro ao buscar mensagem completa!');
  }

  const selectedContacts = [];
  document.querySelectorAll('input[name="selected-contacts"]:checked').forEach(checkbox => {
    selectedContacts.push({
      phone: checkbox.value,
      name: checkbox.nextElementSibling.textContent.split(' (')[0]
    });
  });

  if (selectedContacts.length === 0) {
    return alert('Selecione pelo menos um contato!');
  }

  const validatedContacts = validatePhoneNumbers(selectedContacts);
  const uniqueContacts = validatedContacts.reduce((acc, contact) => {
    if (!acc.some(c => c.phone === contact.phone)) {
      acc.push(contact);
    }
    return acc;
  }, []);

  if (uniqueContacts.length < validatedContacts.length) {
    const dupCount = validatedContacts.length - uniqueContacts.length;
    if (!confirm(`⚠️ ${dupCount} contato(s) duplicado(s) serão ignorados. Continuar?`)) {
      return;
    }
  }

  if (!confirm(`Enviar "${messageText}" para ${uniqueContacts.length} contato(s)?`)) {
    return;
  }

  const sendStatus = document.getElementById('send-status');
  sendStatus.innerHTML = '<p>⏳ Iniciando envio...</p>';
  let successCount = 0;
  let errorCount = 0;

  for (const contact of uniqueContacts) {
    // Substitui o conteúdo em vez de adicionar
    sendStatus.innerHTML = `<p>Enviando para <strong>${contact.name}</strong> (${formatPhone(contact.phone)})...</p>`;

    try {
      await apiRequest('/send-whatsapp', 'POST', {
        phone: contact.phone,
        message: messageText
      });
      
      sendStatus.innerHTML = `<p>Enviando para <strong>${contact.name}</strong> (${formatPhone(contact.phone)})... ✅ Enviado!</p>`;
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error('Erro no envio para', contact.phone, ':', err);
      sendStatus.innerHTML = `<p>Enviando para <strong>${contact.name}</strong> (${formatPhone(contact.phone)})... ❌ Erro: ${err.message || 'Erro desconhecido'}</p>`;
      errorCount++;
    }
  }

  // Mostra o resumo final
  sendStatus.innerHTML = `<p style="color:green;">✅ ${successCount} mensagem(s) enviada(s) com sucesso!</p>`;
  if (errorCount > 0) {
    sendStatus.innerHTML += `<p style="color:red;">❌ ${errorCount} mensagem(s) falharam.</p>`;
  }
}