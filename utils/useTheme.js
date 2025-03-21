import { ref, computed, onMounted, provide } from 'vue';

export function useTheme() {
  const isDarkMode = ref(false);
  
  // Utilise computed pour générer dynamiquement les styles CSS
  const themeStyles = computed(() => {
    if (isDarkMode.value) {
      return {
        '--current-bg-color': 'var(--bg-color-dark)',
        '--current-primary-color': 'var(--primary-color-dark)',
        '--current-secondary-color': 'var(--secondary-color-dark)',
        '--current-link-color': 'var(--link-color-dark)',
        '--current-divider': 'var(--divider-dark)',
        '--current-logo-color': 'var(--logo-color-dark)',
        '--current-header-link-color': 'var(--header-link-color-dark)'
      };
    } else {
      return {
        '--current-bg-color': 'var(--bg-color)',
        '--current-primary-color': 'var(--primary-color)',
        '--current-secondary-color': 'var(--secondary-color)',
        '--current-link-color': 'var(--link-color)',
        '--current-divider': 'var(--divider)',
        '--current-logo-color': 'var(--logo-color)',
        '--current-header-link-color': 'var(--header-link-color)'
      };
    }
  });
  
  // Classes CSS qui restent constantes, peu importe le thème
  const themeClass = computed(() => {
    return {
      'bg-color': true,
      'primary-color': true,
      'secondary-color': true,
      'link-color': true,
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
  provide('themeStyles', themeStyles);
  provide('toggleTheme', toggleTheme);
  
  return {
    isDarkMode,
    themeClass,
    themeStyles,
    toggleTheme
  };
}