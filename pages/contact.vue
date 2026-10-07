<template>
    <Header />
    <div class="flex flex-col items-center">
        <div class="site-container pt-8 sm:pt-16">
            <main>
                <!-- Hero -->
                <h1
                    class="secondary-color text-display reveal-title">
                    {{ $t('contact.title') }}
                </h1>
                <p
                    class="primary-color text-lead md:w-4/5 my-8 sm:my-12 lg:my-16 reveal-text">
                    {{ $t('contact.intro') }}
                </p>
                <div class="w-full h-[2px] divider reveal-divider"></div>

                <div class="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 my-16 md:my-24">
                    <!-- Contact direct -->
                    <section aria-labelledby="contact-direct" class="flex flex-col space-y-8">
                        <h2 id="contact-direct" class="secondary-color text-subtitle reveal-text">
                            {{ $t('contact.direct.title') }}
                        </h2>

                        <a :href="`mailto:${contactEmail}`"
                            class="inline-block text-subtitle secondary-color w-fit smooth-underline-xl reveal-cta break-all">
                            {{ contactEmail }}
                        </a>

                        <p class="primary-color font-bold reveal-text">
                            {{ $t('cta.availability') }}
                        </p>

                        <div class="primary-color font-medium reveal-text">
                            <p>{{ $t('contact.direct.location') }}</p>
                            <LiveClock timezone="Europe/Paris" />
                        </div>

                        <div class="reveal-text">
                            <h3 class="secondary-color font-semibold mb-4">{{ $t('contact.direct.socials') }}</h3>
                            <ul class="flex flex-row flex-wrap gap-x-6 gap-y-2 font-semibold">
                                <li v-for="social in socials" :key="social.name">
                                    <a :href="social.href" target="_blank" rel="noopener noreferrer"
                                        class="secondary-color smooth-underline">
                                        {{ social.name }}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <!-- Formulaire -->
                    <section aria-labelledby="contact-form" class="reveal-element">
                        <h2 id="contact-form" class="secondary-color text-subtitle mb-2">
                            {{ $t('contact.form.title') }}
                        </h2>
                        <p class="primary-color text-sm mb-8">{{ $t('contact.form.requiredHint') }}</p>

                        <form novalidate @submit.prevent="submit" class="flex flex-col space-y-8">
                            <div class="flex flex-col">
                                <label for="contact-name" class="secondary-color font-semibold mb-2">
                                    {{ $t('contact.form.name') }}
                                </label>
                                <input id="contact-name" v-model.trim="form.name" type="text" name="name"
                                    autocomplete="name" maxlength="80" required
                                    :placeholder="$t('contact.form.namePlaceholder')" class="field"
                                    :aria-invalid="errors.name ? 'true' : undefined"
                                    :aria-describedby="errors.name ? 'contact-name-error' : undefined" />
                                <p v-if="errors.name" id="contact-name-error" class="field-error">
                                    {{ $t(`contact.form.errors.name.${errors.name}`) }}
                                </p>
                            </div>

                            <div class="flex flex-col">
                                <label for="contact-email" class="secondary-color font-semibold mb-2">
                                    {{ $t('contact.form.email') }}
                                </label>
                                <input id="contact-email" v-model.trim="form.email" type="email" name="email"
                                    autocomplete="email" maxlength="254" required inputmode="email"
                                    :placeholder="$t('contact.form.emailPlaceholder')" class="field"
                                    :aria-invalid="errors.email ? 'true' : undefined"
                                    :aria-describedby="errors.email ? 'contact-email-error' : undefined" />
                                <p v-if="errors.email" id="contact-email-error" class="field-error">
                                    {{ $t(`contact.form.errors.email.${errors.email}`) }}
                                </p>
                            </div>

                            <div class="flex flex-col">
                                <label for="contact-message" class="secondary-color font-semibold mb-2">
                                    {{ $t('contact.form.message') }}
                                </label>
                                <textarea id="contact-message" v-model.trim="form.message" name="message" rows="6"
                                    maxlength="2000" required :placeholder="$t('contact.form.messagePlaceholder')"
                                    class="field resize-y" :aria-invalid="errors.message ? 'true' : undefined"
                                    :aria-describedby="errors.message ? 'contact-message-error' : undefined"></textarea>
                                <p v-if="errors.message" id="contact-message-error" class="field-error">
                                    {{ $t(`contact.form.errors.message.${errors.message}`) }}
                                </p>
                            </div>

                            <!-- Honeypot : invisible et hors du flux d'accessibilité, rempli uniquement par les robots -->
                            <div class="honeypot" aria-hidden="true">
                                <label for="contact-website">Website</label>
                                <input id="contact-website" v-model="form.website" type="text" name="website"
                                    tabindex="-1" autocomplete="off" />
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0">
                                <button type="submit" :disabled="status === 'sending'"
                                    class="bg-site-secondary text-white px-8 py-4 text-lg font-semibold cursor-pointer transition-colors hover:bg-site-primary disabled:opacity-60 disabled:cursor-not-allowed w-fit">
                                    {{ status === 'sending' ? $t('contact.form.sending') : $t('contact.form.submit') }}
                                </button>
                                <p ref="statusEl" tabindex="-1" role="status" aria-live="polite"
                                    :aria-label="$t('contact.form.statusLabel')" class="font-semibold"
                                    :class="status === 'success' ? 'secondary-color' : 'primary-color'">
                                    {{ statusMessage }}
                                </p>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>

        <Footer />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRevealAnimations } from '~/composables/useRevealAnimations'

const contactEmail = 'contact@erieu.fr'

const socials = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/ethan-rieu-19431626b/' },
    { name: 'Instagram', href: 'https://www.instagram.com/ethan_rieu/' },
    { name: 'GitHub', href: 'https://github.com/EthanRieu' }
]

const { t, locale } = useI18n()

useSeoMeta({
    title: () => t('meta.contact.title'),
    description: () => t('meta.contact.description'),
    ogTitle: () => t('meta.contact.title'),
    ogDescription: () => t('meta.contact.description')
})

useRevealAnimations()

// ---- Formulaire ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const form = reactive({ name: '', email: '', message: '', website: '' })
const errors = reactive({ name: '', email: '', message: '' })
const status = ref('idle') // idle | sending | success | error | rateLimited
const statusEl = ref(null)
const startedAt = ref(0)

onMounted(() => {
    // Horodatage du rendu : le serveur rejette les envois trop rapides (robots)
    startedAt.value = Date.now()
})

const statusMessage = computed(() => {
    switch (status.value) {
        case 'success': return t('contact.form.success')
        case 'error': return t('contact.form.error')
        case 'rateLimited': return t('contact.form.rateLimited')
        default: return ''
    }
})

// Validation client, miroir des règles de server/api/contact.post.ts
const validate = () => {
    errors.name = !form.name ? 'required' : (form.name.length < 2 || form.name.length > 80) ? 'length' : ''
    errors.email = !form.email ? 'required' : (form.email.length > 254 || !EMAIL_RE.test(form.email)) ? 'invalid' : ''
    errors.message = !form.message ? 'required' : (form.message.length < 10 || form.message.length > 2000) ? 'length' : ''
    return !errors.name && !errors.email && !errors.message
}

const focusFirstInvalid = () => {
    const firstInvalid = ['name', 'email', 'message'].find((field) => errors[field])
    if (firstInvalid) {
        document.getElementById(`contact-${firstInvalid}`)?.focus()
    }
}

const submit = async () => {
    if (status.value === 'sending') return

    if (!validate()) {
        await nextTick()
        focusFirstInvalid()
        return
    }

    status.value = 'sending'

    try {
        await $fetch('/api/contact', {
            method: 'POST',
            body: {
                name: form.name,
                email: form.email,
                message: form.message,
                website: form.website,
                startedAt: startedAt.value,
                locale: locale.value
            }
        })
        status.value = 'success'
        form.name = ''
        form.email = ''
        form.message = ''
    } catch (error) {
        const payload = error?.data?.data
        if (error?.statusCode === 429) {
            status.value = 'rateLimited'
        } else if (payload?.fields) {
            // Le serveur a trouvé un champ invalide : on l'affiche sous le champ concerné
            Object.assign(errors, { name: '', email: '', message: '' }, payload.fields)
            status.value = 'idle'
            await nextTick()
            focusFirstInvalid()
            return
        } else {
            status.value = 'error'
        }
    }

    // Annonce du résultat aux lecteurs d'écran et déplacement du focus
    await nextTick()
    statusEl.value?.focus()
}
</script>

<style scoped>
.field {
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 2px solid var(--secondary-color);
    padding: 0.75rem 0;
    font-size: 1.125rem;
    color: var(--primary-color);
    border-radius: 0;
    transition: border-color 0.2s ease;
}

.field::placeholder {
    color: #5f6b6d;
}

.field:focus {
    border-bottom-color: var(--primary-color);
}

.field[aria-invalid='true'] {
    border-bottom-width: 3px;
    border-bottom-color: var(--primary-color);
}

.field-error {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--secondary-color);
}

/* Honeypot : hors écran (pas display:none, certains robots l'ignorent) et hors tabulation */
.honeypot {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
}
</style>
