/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

// Import cypress-file-upload plugin
import 'cypress-file-upload'

// Custom commands for common operations

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to create a new chat
       */
      createNewChat(): Chainable<void>
      
      /**
       * Custom command to send a message
       */
      sendMessage(message: string): Chainable<void>
      
      /**
       * Custom command to wait for AI response
       */
      waitForAIResponse(): Chainable<void>
      
      /**
       * Custom command to upload an image
       */
      uploadImage(fileName: string): Chainable<void>
      
      /**
       * Custom command to clear all chats
       */
      clearAllChats(): Chainable<void>
      
      /**
       * Custom command to export chats
       */
      exportChats(): Chainable<void>
      
      /**
       * Custom command to import chats
       */
      importChats(filePath: string): Chainable<void>
      
      /**
       * Custom command to test print functionality
       */
      testPrintFunction(message: string): Chainable<void>
      
      /**
       * Custom command to mock print window
       */
      mockPrintWindow(): Chainable<{ printContent: string }>
    }
  }
}

// Create new chat
Cypress.Commands.add('createNewChat', () => {
  // Click the new chat button
  cy.get('[data-testid="new-chat-button"]').click()
  
  // Debug: log what's in the chat list
  cy.get('[data-testid="chat-list"]').then(($el) => {
    cy.log('Chat list HTML:', $el.html())
    cy.log('Chat list children count:', $el.children().length)
  })
  
  // Wait for a chat item to appear (more specific than just "not empty")
  cy.get('[data-testid="chat-list"] .card, [data-testid="chat-list"] > div').should('exist')
  
  // Now check for the new chat text
  cy.get('[data-testid="chat-list"]').should('contain', 'New Chat')
})

// Send message
Cypress.Commands.add('sendMessage', (message: string) => {
  cy.get('[data-testid="message-input"]').type(message)
  cy.get('[data-testid="send-button"]').click()
})

// Wait for AI response
Cypress.Commands.add('waitForAIResponse', () => {
  // Since we're using intercepted API calls, we don't need to wait for loading indicator
  // Wait for any message to appear in the message list (the API now echoes back the user's message)
  cy.get('[data-testid="message-list"]').should('not.be.empty')
  // Wait a bit more to ensure the message is fully rendered
  cy.wait(200)
})

// Upload image
Cypress.Commands.add('uploadImage', (fileName: string) => {
  cy.fixture(fileName).then((fileContent) => {
    cy.get('[data-testid="file-input"]').attachFile({
      fileContent,
      fileName,
      mimeType: 'image/png'
    })
  })
})

// Clear all chats
Cypress.Commands.add('clearAllChats', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
  cy.reload()
})

// Export chats
Cypress.Commands.add('exportChats', () => {
  cy.get('[data-testid="export-button"]').click()
  cy.get('[data-testid="export-all-chats"]').click()
})

// Import chats
Cypress.Commands.add('importChats', (filePath: string) => {
  cy.get('[data-testid="import-button"]').click()
  cy.get('[data-testid="import-file-input"]').attachFile(filePath)
})

// Test print functionality
Cypress.Commands.add('testPrintFunction', (message: string) => {
  cy.createNewChat()
  cy.sendMessage(message)
  cy.waitForAIResponse()
  
  // Verify print button exists
  cy.get('.print-message-button').should('be.visible')
  cy.get('.print-message-button').should('contain', '🖨️')
})

// Mock print window for testing
Cypress.Commands.add('mockPrintWindow', () => {
  let printContent = ''
  
  cy.window().then((win) => {
    cy.stub(win, 'open').returns({
      document: {
        write: cy.stub().callsFake((content) => {
          printContent = content
        }),
        close: cy.stub()
      },
      focus: cy.stub(),
      print: cy.stub(),
      onload: null,
      onafterprint: null
    })
  })
  
  return cy.wrap({ printContent })
})
