document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const quickRepliesContainer = document.getElementById('quick-replies');
    const navItems = document.querySelectorAll('.nav-item');

    // Election Knowledge Base
    const knowledgeBase = {
        greeting: {
            text: "Hello! I'm CivicGuide, your personal election assistant. How can I help you prepare for the upcoming elections today?",
            options: [
                { text: "How do I register?", action: "registration" },
                { text: "Election Timeline", action: "timeline" },
                { text: "Voting Process", action: "process" }
            ]
        },
        registration: {
            text: "Registering to vote is the first step! Here's how you do it:",
            steps: [
                "Check your eligibility (must be 18+ and a citizen).",
                "Gather your documents (ID, proof of address).",
                "Fill out the registration form online or in person.",
                "Submit and wait for your Voter ID card."
            ],
            options: [
                { text: "What documents do I need?", action: "documents" },
                { text: "Show me the timeline", action: "timeline" }
            ]
        },
        timeline: {
            text: "Here is the general timeline for the upcoming election cycle:",
            steps: [
                "Registration Deadline: 30 days before election day",
                "Early Voting Begins: 15 days before election day",
                "Absentee Ballot Request Deadline: 7 days before",
                "Election Day: Don't forget to vote!"
            ],
            options: [
                { text: "Tell me about the voting process", action: "process" }
            ]
        },
        process: {
            text: "Voting on election day is simple if you're prepared:",
            steps: [
                "Find your designated polling station.",
                "Bring your Voter ID or approved identification.",
                "Check in with the poll workers.",
                "Proceed to the voting booth and cast your ballot.",
                "Get your 'I Voted' sticker!"
            ],
            options: [
                { text: "What documents do I need?", action: "documents" },
                { text: "Go back to start", action: "greeting" }
            ]
        },
        documents: {
            text: "You will generally need one or more of the following documents to register or vote:",
            steps: [
                "Government-issued Photo ID (Driver's License, Passport)",
                "Utility bill with your name and current address",
                "Bank statement",
                "Birth certificate (for initial registration)"
            ],
            options: [
                { text: "How do I register?", action: "registration" }
            ]
        },
        unknown: {
            text: "I'm not quite sure about that specific question, but I can help you with registration, timelines, the voting process, or required documents. What would you like to know?",
            options: [
                { text: "How do I register?", action: "registration" },
                { text: "Voting Process", action: "process" }
            ]
        }
    };

    // Initialize Chat
    function initChat() {
        // Clear chat
        chatMessages.innerHTML = '';
        // Add greeting
        addBotMessage(knowledgeBase.greeting);
    }

    // Handle Form Submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text) {
            addUserMessage(text);
            userInput.value = '';
            processUserInput(text);
        }
    });

    // Handle Navigation Clicks
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const topic = item.getAttribute('data-topic');
            handleAction(topic);
        });
    });

    function processUserInput(text) {
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const lowerText = text.toLowerCase();
            let response = knowledgeBase.unknown;

            if (lowerText.includes('register') || lowerText.includes('sign up')) {
                response = knowledgeBase.registration;
            } else if (lowerText.includes('time') || lowerText.includes('date') || lowerText.includes('when')) {
                response = knowledgeBase.timeline;
            } else if (lowerText.includes('process') || lowerText.includes('how to vote') || lowerText.includes('booth')) {
                response = knowledgeBase.process;
            } else if (lowerText.includes('document') || lowerText.includes('id') || lowerText.includes('bring')) {
                response = knowledgeBase.documents;
            } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('start')) {
                response = knowledgeBase.greeting;
            }

            addBotMessage(response);
        }, 800); // Simulate network delay
    }

    function handleAction(actionId) {
        const response = knowledgeBase[actionId];
        if (response) {
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addBotMessage(response);
            }, 500);
        }
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                ${escapeHTML(text)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        clearQuickReplies();
    }

    function addBotMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        let contentHtml = `<p>${data.text}</p>`;
        
        // Add steps if they exist
        if (data.steps && data.steps.length > 0) {
            const stepsHtml = data.steps.map((step, index) => `
                <div class="step-card">
                    <div class="step-number">${index + 1}</div>
                    <p>${step}</p>
                </div>
            `).join('');
            contentHtml += `<div class="steps-container">${stepsHtml}</div>`;
        }
        
        // Add interactive options inline if they exist
        if (data.options && data.options.length > 0) {
            const optionsHtml = data.options.map(opt => `
                <button class="option-btn" data-action="${opt.action}">
                    ${opt.text} <i class="fas fa-arrow-right" style="font-size: 10px;"></i>
                </button>
            `).join('');
            contentHtml += `<div class="interactive-options">${optionsHtml}</div>`;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                ${contentHtml}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // Add event listeners to new option buttons
        const newButtons = messageDiv.querySelectorAll('.option-btn');
        newButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                handleAction(action);
                // Optionally visually disable or remove buttons after click to prevent spam
                btn.parentElement.style.opacity = '0.5';
                btn.parentElement.style.pointerEvents = 'none';
            });
        });

        // Update quick replies container at the bottom
        updateQuickReplies(data.options);
        
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-message';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content" style="padding: 12px 16px;">
                <div style="display: flex; gap: 4px;">
                    <div class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
                    <div class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
                    <div class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-secondary); border-radius: 50%; animation: typing 1.4s infinite ease-in-out both;"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function updateQuickReplies(options) {
        quickRepliesContainer.innerHTML = '';
        if (options && options.length > 0) {
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.textContent = opt.text;
                btn.addEventListener('click', () => {
                    handleAction(opt.action);
                });
                quickRepliesContainer.appendChild(btn);
            });
        }
    }

    function clearQuickReplies() {
        quickRepliesContainer.innerHTML = '';
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Start the app
    initChat();
});
