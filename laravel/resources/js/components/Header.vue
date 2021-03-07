<template>
  <header class="fixed top-0 h-16 sm:h-20 w-full bg-blue-200">
    <nav
      class="sm:container flex justify-between items-center h-full px-16 sm:px-20 mx-auto"
    >
      <RouterLink to="/" class="text-xl h-full flex items-center">
        How-to
      </RouterLink>
      <div class="hidden sm:flex justify-between items-center h-full">
        <div class="px-4 h-full flex items-center">
          <button class="focus:outline-none">Submit</button>
        </div>
        <span class="px-4 h-full flex items-center">username</span>
        <div class="px-4 h-full flex items-center">
          <RouterLink to="/login" class="w-full"> Login / Register </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {};
</script>
