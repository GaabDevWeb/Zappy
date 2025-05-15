import { apiRequest } from './api.js';

export function initMessagesSection() {
  document.getElementById('save-message-btn').addEventListener('click', saveMessage);
}

export async function loadMessages() {
  const messagesContainer = document.getElementById('messages-container');
  const messagesList = document.getElementById('messages-list');
  
  try {
    messagesList.innerHTML = '<div class="spinner"></div>';
    const messages = await apiRequest('/get-messages');
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="empty-message">Nenhuma mensagem salva ainda</p>';
      return;
    }
    
    messages.forEach(msg => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="message-card">
          <div class="message-text">${msg.text}</div>
          <div class="message-actions">
            <button class="edit-message-btn" data-id="${msg.id}">Editar</button>
            <button class="delete-message-btn" data-id="${msg.id}">Excluir</button>
          </div>
        </div>
      `;
      messagesList.appendChild(li);
    });

    messagesList.addEventListener('click', handleMessageActions);
  } catch (err) {
    console.error('Erro detalhado:', err);
    messagesList.innerHTML = `<p class="error-message">Erro: ${err.message}</p>`;
  }
}

async function handleMessageActions(e) {
  if (e.target.classList.contains('delete-message-btn')) {
    const id = parseInt(e.target.dataset.id);
    if (confirm('Deseja realmente excluir esta mensagem?')) {
      try {
        await apiRequest('/delete-message', 'POST', { id });
        loadMessages();
      } catch (err) {
        console.error('Erro ao excluir mensagem:', err);
        alert('Erro ao excluir mensagem');
      }
    }
  }
  
  if (e.target.classList.contains('edit-message-btn')) {
    const id = parseInt(e.target.dataset.id);
    const li = e.target.closest('li');
    const messageTextElement = li.querySelector('.message-text');
    const currentText = messageTextElement.textContent;
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText;
    editInput.className = 'edit-message-input';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'edit-buttons';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.className = 'save-edit-btn';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.className = 'cancel-edit-btn';
    
    messageTextElement.replaceWith(editInput);
    li.querySelector('.message-actions').replaceWith(buttonContainer);
    buttonContainer.append(saveButton, cancelButton);
    
    saveButton.addEventListener('click', async () => {
      const newText = editInput.value.trim();
      if (newText && newText !== currentText) {
        try {
          await apiRequest('/update-message', 'POST', { id, text: newText });
          loadMessages();
        } catch (err) {
          console.error('Erro ao atualizar mensagem:', err);
          alert('Erro ao atualizar mensagem');
        }
      } else {
        loadMessages();
      }
    });
    
    cancelButton.addEventListener('click', () => {
      loadMessages();
    });
  }
}

async function saveMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (!message) {
    alert('Por favor, digite uma mensagem');
    return;
  }

  try {
    await apiRequest('/save-message', 'POST', { message });
    messageInput.value = '';
    loadMessages();
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    alert(`Erro ao salvar mensagem: ${err.message}`);
  }
}