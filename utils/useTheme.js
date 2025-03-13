import { ref, computed, onMounted, provide } from 'vue';

export function useTheme() {
  const isDarkMode = ref(false);
  
  const themeClass = computed(() => {
    return {
      'bg-color': !isDarkMode.value,
      'primay-color': !isDarkMode.value,
      'bg-color-dark': isDarkMode.value,
      'primay-color-dark': isDarkMode.value
    };
  });
  
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    saveThemePreference();
  };
  
  const loadThemePreference = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
      } else {
        // Utiliser le mode clair par défaut
        isDarkMode.value = false;
      }
    }
  };
  
  const saveThemePreference = () => {
    if (process.client) {
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    }
  };
  
  onMounted(() => {
    loadThemePreference();
  });
  
  provide('isDarkMode', isDarkMode);
  provide('themeClass', themeClass);
  provide('toggleTheme', toggleTheme);
  
  return {
    isDarkMode,
    themeClass,
    toggleTheme
  };
}