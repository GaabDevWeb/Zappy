import { initMessagesSection, loadMessages } from './modules/messages.js';
import { initContactsSection, loadContacts } from './modules/contacts.js';
import { initMassSendSection } from './modules/massSend.js';

document.addEventListener('DOMContentLoaded', () => {
  initMessagesSection();
  initContactsSection();
  initMassSendSection();
  
  document.querySelector('.toggle-messages').addEventListener('click', async function() {
    const container = document.getElementById('messages-container');
    const isHidden = container.style.display === 'none';
    
    if (isHidden && document.getElementById('messages-list').children.length === 0) {
      await loadMessages();
    }
    
    container.style.display = isHidden ? 'block' : 'none';
    this.innerHTML = isHidden ? 'mensagens salvas ▲' : 'mensagens salvas ▼';
  });
  
  document.querySelector('.toggle-contacts').addEventListener('click', async function() {
    const container = document.getElementById('contacts-container');
    const isHidden = container.style.display === 'none';
    
    if (isHidden && document.getElementById('contacts-list').children.length === 0) {
      await loadContacts();
    }
    
    container.style.display = isHidden ? 'block' : 'none';
    this.innerHTML = isHidden ? 'Contatos salvos ▲' : 'Contatos salvos ▼';
  });
});