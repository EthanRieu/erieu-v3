/**
 * Résout une liste (ou une liste d'objets) définie dans les fichiers de locale.
 * vue-i18n expose les tableaux via tm() sous forme de messages compilés (fonction, AST complet
 * `{ type, body }` ou AST minifié `{ t, b }` produit par @nuxtjs/i18n) : rt() les transforme en chaînes.
 *
 * Usage :  const list = useMessageList()
 *          const tools = computed(() => list('home.tools'))   // [{ name, description }, ...]
 */
const isMessageAst = (value) =>
    ('type' in value && 'body' in value) || ('t' in value && 'b' in value)

export function useMessageList() {
    const { tm, rt } = useI18n()

    const resolve = (value) => {
        if (Array.isArray(value)) return value.map(resolve)
        if (typeof value === 'function' || typeof value === 'string') return rt(value)
        if (value && typeof value === 'object') {
            if (isMessageAst(value)) return rt(value)
            return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolve(entry)]))
        }
        return value
    }

    return (key) => {
        const raw = tm(key)
        return Array.isArray(raw) ? resolve(raw) : []
    }
}
