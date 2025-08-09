<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <NuxtRouteAnnouncer />
    
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="mx-auto max-w-6xl px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Nuxt Responder
            </h1>
            <p class="text-sm text-gray-600 mt-1">AI Response Generator</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-6xl px-6 py-12 min-h-screen">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white/50">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <div class="text-center text-sm text-gray-500">
          <p>Built with Nuxt 4 & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  </div>
</template>