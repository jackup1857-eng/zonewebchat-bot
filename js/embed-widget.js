/**
 * Allzone Technologies - Floating Embed Widget Injector
 * Creates a floating launcher and slide-out glass drawer on any webpage.
 */

(function () {
  function initAllzoneWidget() {
    // Avoid double injection
    if (document.getElementById('allzone-widget-root')) return;

    const root = document.createElement('div');
    root.id = 'allzone-widget-root';
    root.innerHTML = `
      <!-- Launcher Button -->
      <button type="button" class="allzone-widget-launcher" id="allzone-widget-btn" aria-label="Chat with Allzone AI">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Slide-Out Glass Drawer -->
      <div class="allzone-widget-drawer" id="allzone-widget-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-title">
            <div class="bot-avatar">AZ</div>
            <div class="chat-header-text">
              <h3 style="font-size:0.88rem;">Allzone AI Assistant</h3>
              <p style="font-size:0.68rem;">Multi-Agent Systems & Services</p>
            </div>
          </div>
          <button type="button" class="btn-icon" id="allzone-widget-close" aria-label="Close Chat">✕</button>
        </div>

        <!-- Messages Viewport -->
        <div class="messages-viewport" id="widget-chat-messages" style="flex:1; padding:0.85rem; font-size:0.84rem;"></div>

        <!-- Quick Chips Bar -->
        <div class="chips-container" id="widget-quick-chips" style="padding:0.4rem 0.85rem;"></div>

        <!-- Input Bar -->
        <div class="chat-input-area" style="padding:0.65rem 0.85rem;">
          <form class="input-form" id="widget-chat-form">
            <input 
              type="text" 
              id="widget-user-input" 
              class="chat-input" 
              placeholder="Ask about Multi-Agent AI or services..." 
              autocomplete="off" 
              required
            />
            <button type="submit" class="btn-send" id="widget-send-btn" aria-label="Send Message" style="width:34px; height:34px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // Initialize bot instance inside widget
    const widgetBot = new AllzoneChatbot({
      containerId: 'widget-chat-messages',
      inputId: 'widget-user-input',
      chipsId: 'widget-quick-chips',
      isWidget: true
    });

    // Toggle drawer open / close
    const launcherBtn = document.getElementById('allzone-widget-btn');
    const drawer = document.getElementById('allzone-widget-window');
    const closeBtn = document.getElementById('allzone-widget-close');

    launcherBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
      if (drawer.classList.contains('open')) {
        setTimeout(() => {
          document.getElementById('widget-user-input').focus();
        }, 200);
      }
    });

    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllzoneWidget);
  } else {
    initAllzoneWidget();
  }
})();
