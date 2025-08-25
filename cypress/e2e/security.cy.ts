describe('Security Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearAllChats()
    
    // Intercept chat API calls to return mock responses with delay
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        success: true,
        content: 'This is a test response from the AI assistant.',
        model: 'test-model',
        usage: { prompt_tokens: 10, completion_tokens: 20 },
        conversationId: 'test-conversation-id'
      },
              delay: 100 // Reduced delay for faster tests
    }).as('chatRequest')
  })

  describe('XSS Protection', () => {
    it('should sanitize malicious script tags in markdown', () => {
      const maliciousMessage = '<script>alert("XSS")</script>Hello World'
      
      cy.createNewChat()
      cy.sendMessage(maliciousMessage)
      cy.waitForAIResponse()
      
      // Should not execute scripts
      cy.get('[data-testid="message-list"]')
        .should('contain', 'Hello World')
        .and('not.contain', '<script>')
    })

    it('should sanitize malicious iframe tags', () => {
      const maliciousMessage = '<iframe src="javascript:alert(\'XSS\')"></iframe>Test'
      
      cy.createNewChat()
      cy.sendMessage(maliciousMessage)
      cy.waitForAIResponse()
      
      // Should not contain iframe
      cy.get('[data-testid="message-list"]')
        .should('contain', 'Test')
        .and('not.contain', '<iframe>')
    })

    it('should sanitize malicious event handlers', () => {
      const maliciousMessage = '<img src="x" onerror="alert(\'XSS\')">Test'
      
      cy.createNewChat()
      cy.sendMessage(maliciousMessage)
      cy.waitForAIResponse()
      
      // Should not contain event handlers
      cy.get('[data-testid="message-list"]')
        .should('contain', 'Test')
        .and('not.contain', 'onerror=')
    })

    it('should allow safe HTML elements', () => {
      const safeMessage = '<strong>Bold</strong> and <em>italic</em> text'
      
      cy.createNewChat()
      cy.sendMessage(safeMessage)
      cy.waitForAIResponse()
      
      // Should allow safe HTML
      cy.get('[data-testid="message-list"]')
        .should('contain', 'Bold')
        .and('contain', 'italic')
    })
  })

  describe('File Upload Security', () => {
    it('should reject non-image files', () => {
      cy.createNewChat()
      
      // Try to upload a text file
      cy.get('[data-testid="file-input"]').attachFile({
        fileContent: 'This is a text file',
        fileName: 'test.txt',
        mimeType: 'text/plain'
      })
      
      // Should show error message
      cy.contains('Please select image files only').should('be.visible')
      
      // Clear the error and add a message to enable send button
      cy.get('[data-testid="message-input"]').type('Test message')
    })

    it('should reject oversized files', () => {
      cy.createNewChat()
      
      // Create a large file (simulated)
      const largeFile = new Array(11 * 1024 * 1024).join('a') // 11MB
      
      cy.get('[data-testid="file-input"]').attachFile({
        fileContent: largeFile,
        fileName: 'large.jpg',
        mimeType: 'image/jpeg'
      })
      
      // Should show size error
      cy.contains('too large').should('be.visible')
      
      // Clear the error and add a message to enable send button
      cy.get('[data-testid="message-input"]').type('Test message')
    })

    it('should validate file signatures', () => {
      cy.createNewChat()
      
      // Try to upload a file with fake image extension
      cy.get('[data-testid="file-input"]').attachFile({
        fileContent: 'This is not an image',
        fileName: 'fake.png',
        mimeType: 'image/png'
      })
      
      // Should show signature validation error
      cy.contains('corrupted or not a valid image file').should('be.visible')
      
      // Clear the error and add a message to enable send button
      cy.get('[data-testid="message-input"]').type('Test message')
    })
  })

  describe('Input Validation', () => {
    it('should validate required fields', () => {
      cy.createNewChat()
      
      // Try to send empty message
      cy.get('[data-testid="send-button"]').should('be.disabled')
      
      // Type a message to enable the button
      cy.get('[data-testid="message-input"]').type('Test message')
      cy.get('[data-testid="send-button"]').should('not.be.disabled')
    })

    it('should sanitize user input', () => {
      cy.createNewChat()
      
      const inputWithSpecialChars = 'Test<script>alert("xss")</script>'
      cy.get('[data-testid="message-input"]').type(inputWithSpecialChars)
      
      // Should not contain script tags in the input
      cy.get('[data-testid="message-input"]').should('not.contain', '<script>')
    })
  })

  describe('Local Storage Security', () => {
    it('should not expose sensitive data in localStorage', () => {
      cy.createNewChat()
      cy.sendMessage('Test message')
      cy.waitForAIResponse()
      
      // Check localStorage doesn't contain API keys
      cy.window().then((win) => {
        const storage = win.localStorage.getItem('chat-data')
        expect(storage).to.not.contain('API_KEY')
        expect(storage).to.not.contain('api_key')
      })
    })

    it('should properly sanitize stored data', () => {
      const maliciousMessage = '<script>alert("xss")</script>Test'
      
      cy.createNewChat()
      cy.sendMessage(maliciousMessage)
      cy.waitForAIResponse()
      
      // Check localStorage doesn't contain malicious content
      cy.window().then((win) => {
        const storage = win.localStorage.getItem('chat-data')
        expect(storage).to.not.contain('<script>')
        expect(storage).to.contain('Test')
      })
    })
  })

  describe('API Security', () => {
    it('should not expose API keys in client', () => {
      cy.visit('/')
      
      // Check that API keys are not exposed in the client
      cy.window().then((win) => {
        expect(win).to.not.have.property('API_KEY')
        expect(win).to.not.have.property('apiKey')
      })
    })

    it('should validate API responses', () => {
      cy.createNewChat()
      
      // Intercept API call to return error response
      cy.intercept('POST', '/api/chat', { 
        statusCode: 500, 
        body: { error: 'Internal error' } 
      }).as('chatError')
      
      cy.sendMessage('Test message')
      
      // Wait for the error response
      cy.wait('@chatError')
      
      // Should handle API errors gracefully
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Internal server error')
    })
  })
})
